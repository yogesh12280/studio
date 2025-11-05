'use server';

/**
 * @fileOverview An AI-powered tool that suggests employee groupings for bulletin delivery based on their roles and departments.
 *
 * - suggestEmployeeGroupings - A function that handles the suggestion of employee groupings.
 * - TargetedBulletinDeliveryInput - The input type for the suggestEmployeeGroupings function.
 * - TargetedBulletinDeliveryOutput - The return type for the suggestEmployeeGroupings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TargetedBulletinDeliveryInputSchema = z.object({
  bulletinContent: z.string().describe('The content of the bulletin to be delivered.'),
  employeeRoles: z.array(z.string()).describe('A list of all employee roles in the organization.'),
  employeeDepartments: z.array(z.string()).describe('A list of all employee departments in the organization.'),
});
export type TargetedBulletinDeliveryInput = z.infer<typeof TargetedBulletinDeliveryInputSchema>;

const TargetedBulletinDeliveryOutputSchema = z.object({
  suggestedGroupings: z.array(z.string()).describe('A list of suggested employee groupings for bulletin delivery.'),
  reasoning: z.string().describe('The reasoning behind the suggested groupings.'),
});
export type TargetedBulletinDeliveryOutput = z.infer<typeof TargetedBulletinDeliveryOutputSchema>;

export async function suggestEmployeeGroupings(input: TargetedBulletinDeliveryInput): Promise<TargetedBulletinDeliveryOutput> {
  return targetedBulletinDeliveryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'targetedBulletinDeliveryPrompt',
  input: {schema: TargetedBulletinDeliveryInputSchema},
  output: {schema: TargetedBulletinDeliveryOutputSchema},
  prompt: `You are an expert in organizational communication.

  Given the following bulletin content, employee roles, and employee departments, suggest the most effective employee groupings for delivering the bulletin to ensure efficient information dissemination.

  Bulletin Content: {{{bulletinContent}}}
  Employee Roles: {{#each employeeRoles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Employee Departments: {{#each employeeDepartments}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Consider the relevance of the bulletin content to different roles and departments.
  Provide a list of suggested employee groupings and a brief explanation of your reasoning.
  Format your repsonse as a JSON object conforming to the schema.
`,
});

const targetedBulletinDeliveryFlow = ai.defineFlow(
  {
    name: 'targetedBulletinDeliveryFlow',
    inputSchema: TargetedBulletinDeliveryInputSchema,
    outputSchema: TargetedBulletinDeliveryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
