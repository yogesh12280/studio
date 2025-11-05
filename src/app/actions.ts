'use server'

import {
  suggestEmployeeGroupings,
  type TargetedBulletinDeliveryInput,
} from '@/ai/flows/targeted-bulletin-delivery'
import { employees } from '@/lib/data'

export async function getTargetedGroups(bulletinContent: string) {
  try {
    const employeeRoles = [...new Set(employees.map((e) => e.role))]
    const employeeDepartments = [...new Set(employees.map((e) => e.department))]

    const input: TargetedBulletinDeliveryInput = {
      bulletinContent,
      employeeRoles,
      employeeDepartments,
    }

    const result = await suggestEmployeeGroupings(input)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error in getTargetedGroups action:', error)
    return { success: false, error: 'Failed to get suggestions from AI.' }
  }
}
