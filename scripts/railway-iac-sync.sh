#!/bin/bash
# Advanced Railway IAC Synchronization Script
# Scans environment, compares with IAC files, creates/updates missing services
# Fully declarative and idempotent - safe to run multiple times

set +e  # Don't exit on errors - we'll handle them

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/railway-services.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
SERVICES_CREATED=0
SERVICES_UPDATED=0
DATABASES_CREATED=0
VARIABLES_SET=0
ERRORS=0

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Railway IAC Synchronization          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Load .env file into associative array
declare -A ENV_VALUES
load_env_file() {
    local env_file="$PROJECT_ROOT/.env"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}⚠️  .env file not found at $env_file${NC}"
        echo -e "   Variables with \${VAR_NAME} format will be skipped"
        return 0
    fi
    
    echo -e "${BLUE}→ Loading variables from .env file...${NC}"
    local loaded=0
    
    # Read .env file line by line
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Extract key=value (handle quoted values)
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            
            # Remove quotes if present
            value=$(echo "$value" | sed "s/^['\"]//;s/['\"]$//")
            
            ENV_VALUES["$key"]="$value"
            loaded=$((loaded + 1))
        fi
    done < "$env_file"
    
    echo -e "   ${GREEN}✓${NC} Loaded ${CYAN}$loaded${NC} variables from .env"
}

# Resolve variable reference (e.g., ${VAR_NAME} -> actual value from .env)
resolve_var_reference() {
    local value="$1"
    
    # Check if it's a variable reference like ${VAR_NAME}
    if [[ "$value" =~ ^\$\{([^}]+)\}$ ]]; then
        local var_name="${BASH_REMATCH[1]}"
        
        # Check if we have it in .env
        if [ -n "${ENV_VALUES[$var_name]}" ]; then
            echo "${ENV_VALUES[$var_name]}"
            return 0
        else
            # Return original if not found in .env
            echo "$value"
            return 1
        fi
    else
        # Not a variable reference, return as-is
        echo "$value"
        return 0
    fi
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}→ Checking prerequisites...${NC}"
    
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not found${NC}"
        echo "   Install: https://docs.railway.app/develop/cli"
        exit 1
    fi
    
    if ! railway whoami &> /dev/null; then
        echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
        railway login
    fi
    
    if ! railway status &> /dev/null; then
        echo -e "${RED}❌ Not linked to a Railway project${NC}"
        echo "   Run: railway link"
        exit 1
    fi
    
    # Check for jq or Python
    if command -v jq &> /dev/null; then
        USE_JQ=true
    elif command -v python3 &> /dev/null; then
        USE_JQ=false
        echo -e "${YELLOW}⚠️  jq not found - using Python fallback${NC}"
    else
        echo -e "${RED}❌ Neither jq nor python3 found${NC}"
        echo "   Install jq: https://stedolan.github.io/jq/download/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites OK${NC}"
    echo ""
}

# Get current Railway project info
get_project_info() {
    echo -e "${BLUE}→ Getting project information...${NC}"
    
    STATUS_OUTPUT=$(railway status 2>/dev/null)
    PROJECT_NAME=$(echo "$STATUS_OUTPUT" | grep "Project:" | sed 's/.*Project: //' | awk '{print $1}' || echo "unknown")
    ENVIRONMENT=$(echo "$STATUS_OUTPUT" | grep "Environment:" | sed 's/.*Environment: //' | awk '{print $1}' || echo "production")
    
    if [ "$PROJECT_NAME" = "unknown" ]; then
        echo -e "${RED}❌ Could not determine project${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Project: ${CYAN}${PROJECT_NAME}${NC}"
    echo -e "${GREEN}✅ Environment: ${CYAN}${ENVIRONMENT}${NC}"
    echo ""
}

# Discover existing services (try common names and check which work)
discover_existing_services() {
    echo -e "${BLUE}→ Discovering existing services...${NC}"
    
    EXISTING_SERVICES=()
    
    # Try to discover services from IAC config first
    if [ -f "$CONFIG_FILE" ]; then
        if [ "$USE_JQ" = true ]; then
            CONFIGURED_SERVICES=$(jq -r '.services | keys[]' "$CONFIG_FILE" 2>/dev/null)
        else
            CONFIGURED_SERVICES=$(CONFIG_FILE_PY="$CONFIG_FILE" python3 -c "
import json, os
config_file = os.environ.get('CONFIG_FILE_PY', 'railway-services.json')
if os.path.exists(config_file):
    with open(config_file, 'r') as f:
        config = json.load(f)
    services = config.get('services', {})
    for k in services.keys():
        print(k)
" 2>/dev/null)
        fi
    else
        CONFIGURED_SERVICES="web worker"
    fi
    
    # Test each service name
    for svc in $CONFIGURED_SERVICES; do
        if railway service "$svc" &>/dev/null; then
            EXISTING_SERVICES+=("$svc")
            echo -e "  ${GREEN}✓${NC} Found: ${CYAN}$svc${NC}"
        fi
    done
    
    # Also check for common service names
    for svc in api backend frontend; do
        if railway service "$svc" &>/dev/null 2>&1; then
            if [[ ! " ${EXISTING_SERVICES[@]} " =~ " ${svc} " ]]; then
                EXISTING_SERVICES+=("$svc")
                echo -e "  ${GREEN}✓${NC} Found: ${CYAN}$svc${NC}"
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Discovered ${#EXISTING_SERVICES[@]} existing service(s)${NC}"
    echo ""
}

# Discover existing databases
discover_existing_databases() {
    echo -e "${BLUE}→ Discovering existing databases...${NC}"
    
    EXISTING_DATABASES=()
    
    # Railway databases are typically named "Postgres" or "Redis" as services
    # Check if database services exist by trying to switch to them
    # Also check if any service has DATABASE_URL or REDIS_URL variables
    
    # Method 1: Check for database services by name
    if railway service Postgres &>/dev/null || railway service postgres &>/dev/null; then
        EXISTING_DATABASES+=("postgres")
        echo -e "  ${GREEN}✓${NC} Found: ${CYAN}PostgreSQL${NC} (via service name)"
    fi
    
    if railway service Redis &>/dev/null || railway service redis &>/dev/null; then
        EXISTING_DATABASES+=("redis")
        echo -e "  ${GREEN}✓${NC} Found: ${CYAN}Redis${NC} (via service name)"
    fi
    
    # Method 2: Check all existing services for database URL variables
    # This catches databases that are linked but not named exactly "Postgres"/"Redis"
    for svc in "${EXISTING_SERVICES[@]}"; do
        # Check web service for database URLs (most services link to DBs)
        if railway service "$svc" &>/dev/null; then
            # Check for PostgreSQL
            if [ "${EXISTING_DATABASES[*]}" != *"postgres"* ]; then
                DB_URL=$(railway variables get DATABASE_URL 2>/dev/null | head -1 | grep -i postgres || echo "")
                if [ -n "$DB_URL" ]; then
                    EXISTING_DATABASES+=("postgres")
                    echo -e "  ${GREEN}✓${NC} Found: ${CYAN}PostgreSQL${NC} (via DATABASE_URL in $svc)"
                fi
            fi
            
            # Check for Redis
            if [ "${EXISTING_DATABASES[*]}" != *"redis"* ]; then
                REDIS_URL=$(railway variables get REDIS_URL 2>/dev/null | head -1 | grep -i redis || echo "")
                if [ -n "$REDIS_URL" ]; then
                    EXISTING_DATABASES+=("redis")
                    echo -e "  ${GREEN}✓${NC} Found: ${CYAN}Redis${NC} (via REDIS_URL in $svc)"
                fi
            fi
        fi
    done
    
    # Method 3: If no services found yet, try checking from any service context
    if [ ${#EXISTING_DATABASES[@]} -eq 0 ] && [ ${#EXISTING_SERVICES[@]} -gt 0 ]; then
        # Use first available service to check for database URLs
        FIRST_SVC="${EXISTING_SERVICES[0]}"
        if railway service "$FIRST_SVC" &>/dev/null; then
            # Check PostgreSQL
            DB_CHECK=$(railway variables 2>/dev/null | grep -i "DATABASE_URL" | head -1 | grep -i postgres || echo "")
            if [ -n "$DB_CHECK" ]; then
                EXISTING_DATABASES+=("postgres")
                echo -e "  ${GREEN}✓${NC} Found: ${CYAN}PostgreSQL${NC} (via variables)"
            fi
            
            # Check Redis
            REDIS_CHECK=$(railway variables 2>/dev/null | grep -i "REDIS_URL" | head -1 | grep -i redis || echo "")
            if [ -n "$REDIS_CHECK" ]; then
                EXISTING_DATABASES+=("redis")
                echo -e "  ${GREEN}✓${NC} Found: ${CYAN}Redis${NC} (via variables)"
            fi
        fi
    fi
    
    # Method 4: Final check - try to get variables directly (project-level)
    if [ ${#EXISTING_DATABASES[@]} -eq 0 ]; then
        # Try checking environment variables directly
        ENV_VARS=$(railway variables 2>/dev/null || echo "")
        
        if echo "$ENV_VARS" | grep -qi "DATABASE_URL.*postgres"; then
            EXISTING_DATABASES+=("postgres")
            echo -e "  ${GREEN}✓${NC} Found: ${CYAN}PostgreSQL${NC} (via environment variables)"
        fi
        
        if echo "$ENV_VARS" | grep -qi "REDIS_URL.*redis"; then
            EXISTING_DATABASES+=("redis")
            echo -e "  ${GREEN}✓${NC} Found: ${CYAN}Redis${NC} (via environment variables)"
        fi
    fi
    
    echo -e "${GREEN}✅ Discovered ${#EXISTING_DATABASES[@]} existing database(s)${NC}"
    
    if [ ${#EXISTING_DATABASES[@]} -eq 0 ]; then
        echo -e "  ${YELLOW}⚠${NC}  No databases detected - they may be linked but not discovered"
        echo -e "  ${YELLOW}   If databases already exist, they won't be recreated${NC}"
    fi
    
    echo ""
}

# Check if service exists
service_exists() {
    local service_name=$1
    for existing in "${EXISTING_SERVICES[@]}"; do
        if [ "$existing" = "$service_name" ]; then
            return 0
        fi
    done
    return 1
}

# Check if database exists
database_exists() {
    local db_type=$1
    for existing in "${EXISTING_DATABASES[@]}"; do
        if [ "$existing" = "$db_type" ]; then
            return 0
        fi
    done
    return 1
}

# Create a service
create_service() {
    local service_name=$1
    local dockerfile_path=$2
    local docker_image=$3
    local repo_url=$4
    
    echo -e "${YELLOW}  → Creating service: ${CYAN}${service_name}${NC}"
    
    local success=false
    
    # Determine repo URL (from config or git remote)
    if [ -z "$repo_url" ]; then
        repo_url=$(git remote get-url origin 2>/dev/null || echo "")
    fi
    
    # Try creating with Dockerfile path first
    if [ -n "$dockerfile_path" ]; then
        echo -e "    Using Dockerfile: ${BLUE}$dockerfile_path${NC}"
        if [ -n "$repo_url" ]; then
            echo -e "    From repository: ${BLUE}$repo_url${NC}"
            if railway add --service "$service_name" --repo "$repo_url" &>/dev/null; then
                railway service "$service_name" &>/dev/null
                railway variables --set "RAILWAY_DOCKERFILE_PATH=$dockerfile_path" &>/dev/null && echo -e "    ${GREEN}✓${NC} Set RAILWAY_DOCKERFILE_PATH" || true
                success=true
            fi
        else
            if railway add --service "$service_name" &>/dev/null; then
                railway service "$service_name" &>/dev/null
                railway variables --set "RAILWAY_DOCKERFILE_PATH=$dockerfile_path" &>/dev/null && echo -e "    ${GREEN}✓${NC} Set RAILWAY_DOCKERFILE_PATH" || true
                success=true
            fi
        fi
    fi
    
    # If that failed and we have a docker image, try that
    if [ "$success" = false ] && [ -n "$docker_image" ]; then
        echo -e "    Using Docker image: ${BLUE}$docker_image${NC}"
        if railway add --service "$service_name" --image "$docker_image" &>/dev/null; then
            success=true
        fi
    fi
    
    # If still failed, try default (from repo or current directory)
    if [ "$success" = false ]; then
        echo -e "    Creating from repository..."
        if [ -n "$repo_url" ]; then
            railway add --service "$service_name" --repo "$repo_url" &>/dev/null && success=true || true
        else
            railway add --service "$service_name" &>/dev/null && success=true || true
        fi
    fi
    
    if [ "$success" = true ]; then
        echo -e "    ${GREEN}✅ Service created${NC}"
        EXISTING_SERVICES+=("$service_name")
        SERVICES_CREATED=$((SERVICES_CREATED + 1))
        return 0
    else
        echo -e "    ${RED}❌ Failed to create service${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Create a database (with safety checks)
create_database() {
    local db_type=$1
    
    echo -e "${YELLOW}  → Attempting to add database: ${CYAN}${db_type}${NC}"
    echo -e "    ${BLUE}Checking if database already exists...${NC}"
    
    # Final safety check - re-discover databases before creating
    local db_exists=false
    
    # Check service names
    if railway service "Postgres" &>/dev/null || railway service "postgres" &>/dev/null || \
       railway service "Redis" &>/dev/null || railway service "redis" &>/dev/null; then
        # One of the databases exists, check which one
        if [ "$db_type" = "postgres" ]; then
            if railway service "Postgres" &>/dev/null || railway service "postgres" &>/dev/null; then
                db_exists=true
            fi
        elif [ "$db_type" = "redis" ]; then
            if railway service "Redis" &>/dev/null || railway service "redis" &>/dev/null; then
                db_exists=true
            fi
        fi
    fi
    
    # Check variables if service check didn't find it
    if [ "$db_exists" = false ]; then
        # Switch to web service if available to check variables
        if [ ${#EXISTING_SERVICES[@]} -gt 0 ]; then
            FIRST_SVC="${EXISTING_SERVICES[0]}"
            railway service "$FIRST_SVC" &>/dev/null
            
            if [ "$db_type" = "postgres" ]; then
                DB_CHECK=$(railway variables 2>/dev/null | grep -i "DATABASE_URL" | grep -i postgres | head -1 || echo "")
                if [ -n "$DB_CHECK" ]; then
                    db_exists=true
                fi
            elif [ "$db_type" = "redis" ]; then
                REDIS_CHECK=$(railway variables 2>/dev/null | grep -i "REDIS_URL" | grep -i redis | head -1 || echo "")
                if [ -n "$REDIS_CHECK" ]; then
                    db_exists=true
                fi
            fi
        fi
    fi
    
    if [ "$db_exists" = true ]; then
        echo -e "    ${GREEN}✅ Database already exists - skipping creation${NC}"
        EXISTING_DATABASES+=("$db_type")
        return 0
    fi
    
    # Database doesn't exist, try to create it
    echo -e "    ${YELLOW}Database not found, creating...${NC}"
    CREATE_OUTPUT=$(railway add --database "$db_type" 2>&1)
    CREATE_EXIT=$?
    
    if [ $CREATE_EXIT -eq 0 ]; then
        # Check output for any warnings about existing databases
        if echo "$CREATE_OUTPUT" | grep -qiE "already exists|duplicate|already have|already added"; then
            echo -e "    ${GREEN}✅ Database already exists (Railway prevented duplicate)${NC}"
            EXISTING_DATABASES+=("$db_type")
            return 0
        else
            echo -e "    ${GREEN}✅ Database created successfully${NC}"
            EXISTING_DATABASES+=("$db_type")
            DATABASES_CREATED=$((DATABASES_CREATED + 1))
            return 0
        fi
    else
        # Check if error is because it already exists (Railway might return error for duplicates)
        if echo "$CREATE_OUTPUT" | grep -qiE "already exists|duplicate|already have|already added|cannot add"; then
            echo -e "    ${GREEN}✅ Database already exists (Railway prevented duplicate)${NC}"
            EXISTING_DATABASES+=("$db_type")
            return 0
        else
            echo -e "    ${RED}❌ Failed to create database${NC}"
            echo -e "    ${YELLOW}   Output: ${CREATE_OUTPUT}${NC}"
            echo -e "    ${YELLOW}   If database already exists, you can ignore this error${NC}"
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    fi
}

# Configure service environment variables
configure_service_variables() {
    local service_name=$1
    local env_vars_json=$2
    
    echo -e "${BLUE}  → Configuring environment variables...${NC}"
    
    # Switch to service
    if ! railway service "$service_name" &>/dev/null; then
        echo -e "    ${RED}❌ Could not switch to service${NC}"
        return 1
    fi
    
    local vars_set=0
    
    if [ "$USE_JQ" = true ]; then
        # Use jq to extract and set variables
        while IFS='=' read -r key value; do
            if [ -n "$key" ] && [ "$key" != "null" ]; then
                # Remove quotes and handle special values
                value=$(echo "$value" | sed "s/^\"//;s/\"$//;s/^'//;s/'$//")
                
                # Try to resolve variable reference (e.g., ${VAR_NAME} -> actual value)
                resolved_value=$(resolve_var_reference "$value")
                if [ $? -eq 0 ] && [ "$resolved_value" != "$value" ]; then
                    # Successfully resolved from .env
                    value="$resolved_value"
                    echo -e "    ${GREEN}✓${NC} Resolved ${BLUE}$key${NC} from .env"
                elif [[ "$value" =~ ^\$\{[^}]+\}$ ]]; then
                    # Variable reference but not found in .env
                    echo -e "    ${YELLOW}⚠${NC}  Skipping ${BLUE}$key${NC} (${CYAN}${value}${NC} not found in .env)"
                    continue
                fi
                
                if railway variables --set "$key=$value" &>/dev/null; then
                    VARIABLES_SET=$((VARIABLES_SET + 1))
                    echo -e "    ${GREEN}✓${NC} Set ${BLUE}$key${NC}"
                else
                    echo -e "    ${YELLOW}⚠${NC}  Failed to set ${BLUE}$key${NC}"
                fi
            fi
        done < <(echo "$env_vars_json" | jq -r 'to_entries[] | "\(.key)=\(.value)"' 2>/dev/null)
    else
        # Python fallback
        # Export ENV_VALUES as JSON for Python (properly escaping)
        local env_json="{}"
        if [ ${#ENV_VALUES[@]} -gt 0 ]; then
            # Temporarily export variables with prefix for Python to read
            for key in "${!ENV_VALUES[@]}"; do
                export "ENV_VAL_$key"="${ENV_VALUES[$key]}"
            done
            
            env_json=$(python3 << 'PYEOF2'
import json
import os

env_dict = {}
for key in os.environ:
    if key.startswith('ENV_VAL_'):
        actual_key = key.replace('ENV_VAL_', '')
        env_dict[actual_key] = os.environ[key]

print(json.dumps(env_dict))
PYEOF2
)
            
            # Clean up temporary exports
            for key in "${!ENV_VALUES[@]}"; do
                unset "ENV_VAL_$key"
            done
        fi
        
        # Pass env_json and env_vars_json to Python via environment variables
        export ENV_JSON_PY="$env_json"
        export ENV_VARS_JSON_PY="$env_vars_json"
        
        PYEOF_OUTPUT=$(python3 << 'PYEOF'
import json, sys, subprocess, os, re

env_vars = json.loads(os.environ.get('ENV_VARS_JSON_PY', '{}'))
env_file_values = json.loads(os.environ.get('ENV_JSON_PY', '{}'))
vars_set = 0

def resolve_var_ref(value):
    """Resolve ${VAR_NAME} to actual value from .env"""
    if not isinstance(value, str):
        return value, False
    
    match = re.match(r'^\$\{([^}]+)\}$', value)
    if match:
        var_name = match.group(1)
        if var_name in env_file_values:
            return env_file_values[var_name], True
        else:
            return value, False
    return value, False

for key, value in env_vars.items():
    if key and value is not None:
        # Try to resolve variable reference
        resolved_value, was_resolved = resolve_var_ref(value)
        
        if was_resolved:
            print(f"    ✓ Resolved {key} from .env", file=sys.stderr)
            value = resolved_value
        elif isinstance(value, str) and '${' in value:
            print(f"    ⚠ Skipping {key} ({value} not found in .env)", file=sys.stderr)
            continue
        
        result = subprocess.run(
            ['railway', 'variables', '--set', f'{key}={value}'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            vars_set += 1
            print(f"    ✓ Set {key}", file=sys.stderr)
        else:
            print(f"    ⚠ Failed to set {key}: {result.stderr[:100] if result.stderr else 'unknown error'}", file=sys.stderr)

print(f"{vars_set}")
sys.exit(0 if vars_set > 0 else 1)
PYEOF
)
        local vars_count="${PYEOF_OUTPUT:-0}"
        VARIABLES_SET=$((VARIABLES_SET + vars_count))
        
        # Clean up exports
        unset ENV_JSON_PY
        unset ENV_VARS_JSON_PY
    fi
    
    echo -e "    ${GREEN}✅ Variables configured${NC}"
}

# Sync databases from IAC
sync_databases() {
    if [ ! -f "$CONFIG_FILE" ]; then
        return 0
    fi
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🗄️  Synchronizing Databases${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ "$USE_JQ" = true ]; then
        DESIRED_DATABASES=$(jq -r '.databases // {} | keys[]' "$CONFIG_FILE" 2>/dev/null)
    else
        # Use environment variable to pass config file path
        DESIRED_DATABASES=$(CONFIG_FILE_PY="$CONFIG_FILE" python3 -c "
import json, os
config_file = os.environ.get('CONFIG_FILE_PY', 'railway-services.json')
if os.path.exists(config_file):
    with open(config_file, 'r') as f:
        config = json.load(f)
    databases = config.get('databases', {})
    for k in databases.keys():
        print(k)
" 2>/dev/null)
    fi
    
    if [ -z "$DESIRED_DATABASES" ]; then
        echo -e "${YELLOW}  No databases defined in IAC${NC}"
        echo ""
        return 0
    fi
    
    while IFS= read -r db_type; do
        if [ -z "$db_type" ]; then continue; fi
        
        echo -e "${BLUE}📦 Database: ${CYAN}${db_type}${NC}"
        
        if database_exists "$db_type"; then
            echo -e "  ${GREEN}✓${NC} Already exists (skipping)"
        else
            echo -e "  ${YELLOW}⚠${NC}  Not detected - attempting to create..."
            echo -e "  ${YELLOW}   Note: If database already exists, Railway will prevent duplicate creation${NC}"
            create_database "$db_type"
        fi
        echo ""
    done <<< "$DESIRED_DATABASES"
}

# Sync services from IAC
sync_services() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ IAC config file not found: $CONFIG_FILE${NC}"
        return 1
    fi
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🚀 Synchronizing Services${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ "$USE_JQ" = true ]; then
        # Use jq to process services (avoid subshell with process substitution)
        while IFS= read -r service_entry; do
            service_name=$(echo "$service_entry" | jq -r '.key')
            service_config=$(echo "$service_entry" | jq -c '.value')
            
            echo -e "${BLUE}📦 Service: ${CYAN}${service_name}${NC}"
            
            # Extract service details
            dockerfile_path=$(echo "$service_config" | jq -r '.environmentVariables.RAILWAY_DOCKERFILE_PATH // empty')
            repo_url=$(echo "$service_config" | jq -r '.source // empty')
            docker_image=""
            if [ "$service_name" = "rsshub" ] && [ -z "$dockerfile_path" ]; then
                docker_image="diygod/rsshub:latest"
            fi
            env_vars=$(echo "$service_config" | jq -c '.environmentVariables // {}')
            
            if service_exists "$service_name"; then
                echo -e "  ${GREEN}✓${NC} Already exists"
                SERVICES_UPDATED=$((SERVICES_UPDATED + 1))
            else
                echo -e "  ${YELLOW}⚠${NC}  Missing - creating..."
                create_service "$service_name" "$dockerfile_path" "$docker_image" "$repo_url"
            fi
            
            # Configure variables
            configure_service_variables "$service_name" "$env_vars"
            echo ""
        done < <(jq -c '.services | to_entries[]' "$CONFIG_FILE")
    else
        # Python-based processing
        # Export variables for Python
        export CONFIG_FILE_PY="$CONFIG_FILE"
        export EXISTING_SERVICES_PY=$(IFS=' '; echo "${EXISTING_SERVICES[@]}")
        
        python3 << PYEOF
import json, sys, subprocess, os

config_file = os.environ.get('CONFIG_FILE_PY')
existing_services_str = os.environ.get('EXISTING_SERVICES_PY', '')

if not config_file or not os.path.exists(config_file):
    print(f"❌ IAC config file not found: {config_file}")
    sys.exit(1)

with open(config_file, 'r') as f:
    config = json.load(f)

services = config.get('services', {})
existing_services = existing_services_str.split() if existing_services_str else []

for name, service_config in services.items():
    print(f"📦 Service: {name}")
    
    env_vars = service_config.get('environmentVariables', {})
    dockerfile = env_vars.get('RAILWAY_DOCKERFILE_PATH', '')
    repo_url = service_config.get('source', '')
    docker_image = ''
    
    if name == 'rsshub' and not dockerfile:
        docker_image = 'diygod/rsshub:latest'
    
    # Check if service exists
    service_exists = name in existing_services
    
    if service_exists:
        print("  ✓ Already exists")
    else:
        print("  ⚠ Missing - creating...")
        # Create service
        # Get repo URL from config
        repo_url = service_config.get('source', '')
        
        if dockerfile:
            if repo_url:
                result = subprocess.run(['railway', 'add', '--service', name, '--repo', repo_url], capture_output=True, text=True)
            else:
                result = subprocess.run(['railway', 'add', '--service', name], capture_output=True, text=True)
            if result.returncode == 0:
                subprocess.run(['railway', 'service', name], capture_output=True)
                subprocess.run(['railway', 'variables', '--set', f'RAILWAY_DOCKERFILE_PATH={dockerfile}'], capture_output=True)
        elif docker_image:
            subprocess.run(['railway', 'add', '--service', name, '--image', docker_image], capture_output=True)
        else:
            if repo_url:
                subprocess.run(['railway', 'add', '--service', name, '--repo', repo_url], capture_output=True)
            else:
                subprocess.run(['railway', 'add', '--service', name], capture_output=True)
    
    # Configure variables
    print("  → Configuring environment variables...")
    subprocess.run(['railway', 'service', name], capture_output=True)
    
    vars_set = 0
    for key, value in env_vars.items():
        if isinstance(value, str) and '\${' in value:
            continue  # Skip variable references
        result = subprocess.run(['railway', 'variables', '--set', f'{key}={value}'], capture_output=True, text=True)
        if result.returncode == 0:
            vars_set += 1
            print(f"    ✓ Set {key}")
        else:
            print(f"    ⚠ Failed to set {key}")
    
    print(f"  ✅ Service configured ({vars_set} variables set)")
    print()

PYEOF
    fi
}

# Main execution
main() {
    check_prerequisites
    load_env_file
    get_project_info
    discover_existing_services
    discover_existing_databases
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ IAC config file not found: $CONFIG_FILE${NC}"
        echo "   Create railway-services.json to use IAC synchronization"
        exit 1
    fi
    
    sync_databases
    sync_services
    
    # Summary
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Synchronization Complete!            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Summary:${NC}"
    echo -e "  ${GREEN}Services created:${NC} ${CYAN}$SERVICES_CREATED${NC}"
    echo -e "  ${BLUE}Services updated:${NC} ${CYAN}$SERVICES_UPDATED${NC}"
    echo -e "  ${GREEN}Databases created:${NC} ${CYAN}$DATABASES_CREATED${NC}"
    echo -e "  ${BLUE}Variables configured:${NC} ${CYAN}$VARIABLES_SET${NC}"
    
    if [ $ERRORS -gt 0 ]; then
        echo -e "  ${RED}Errors encountered:${NC} ${CYAN}$ERRORS${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Verify services: railway status"
    echo "  2. Check logs: railway logs --service <name>"
    echo "  3. Set sensitive variables (API keys, secrets) manually"
    echo "  4. Deploy services: railway up"
    echo ""
}

# Run main function
main
