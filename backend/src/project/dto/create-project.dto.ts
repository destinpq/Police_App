export class CreateProjectDto {
  name: string;
  description: string;
  budget?: number;
  budgetSpent?: number;
  budgetCurrency?: string;
} 