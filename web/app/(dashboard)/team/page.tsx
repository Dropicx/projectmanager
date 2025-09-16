'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@consulting-platform/ui'
import { Users, Mail, Shield, Calendar, Search, UserPlus, MoreVertical, Edit, Trash2 } from 'lucide-react'

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with actual data from API
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@consailt.com',
      role: 'Senior Consultant',
      department: 'Strategy',
      joinedDate: '2023-01-15',
      status: 'active',
      projects: 5,
      avatar: null
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@consailt.com',
      role: 'Project Manager',
      department: 'Operations',
      joinedDate: '2023-03-22',
      status: 'active',
      projects: 3,
      avatar: null
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@consailt.com',
      role: 'Data Analyst',
      department: 'Analytics',
      joinedDate: '2023-06-10',
      status: 'active',
      projects: 4,
      avatar: null
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james.wilson@consailt.com',
      role: 'UX Designer',
      department: 'Design',
      joinedDate: '2023-02-28',
      status: 'active',
      projects: 2,
      avatar: null
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@consailt.com',
      role: 'Business Analyst',
      department: 'Strategy',
      joinedDate: '2023-04-15',
      status: 'inactive',
      projects: 1,
      avatar: null
    }
  ]

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const departmentStats = {
    Strategy: 2,
    Operations: 1,
    Analytics: 1,
    Design: 1
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">Manage your team members and their roles</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Departments</CardTitle>
            <Shield className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(departmentStats).length}</div>
            <p className="text-xs text-gray-500 mt-1">Across organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.reduce((sum, m) => sum + m.projects, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Team Size</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(teamMembers.reduce((sum, m) => sum + m.projects, 0) / teamMembers.filter(m => m.projects > 0).length).toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per project</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Member</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Projects</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{member.role}</td>
                    <td className="py-4 px-4 text-gray-700">{member.department}</td>
                    <td className="py-4 px-4 text-gray-700">{member.projects}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Mail className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(departmentStats).map(([dept, count]) => (
              <div key={dept} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{dept}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}