import { PracticeDialogue } from '../types';

export const PREDEFINED_DIALOGUES: PracticeDialogue[] = [
  {
    id: 'd1',
    title: 'Ordering Coffee',
    description: 'Practice ordering a coffee and answering questions about your order.',
    difficulty: 'A1-A2',
    roles: {
      user: 'Customer',
      ai: 'Barista'
    },
    scenario: 'You are at a busy coffee shop. You want to order a medium cappuccino with oat milk and a blueberry muffin.',
    startingLine: 'Hi there! What can I get started for you today?'
  },
  {
    id: 'd2',
    title: 'Hotel Check-in',
    description: 'Arrive at a hotel and go through the check-in process.',
    difficulty: 'A1-A2',
    roles: {
      user: 'Guest',
      ai: 'Receptionist'
    },
    scenario: 'You are checking into a hotel. You have a reservation under the name "Smith" for 3 nights.',
    startingLine: 'Welcome to the Grand Hotel. How can I help you today?'
  },
  {
    id: 'd3',
    title: 'Job Interview',
    description: 'Answer common job interview questions for a marketing position.',
    difficulty: 'B1-B2',
    roles: {
      user: 'Candidate',
      ai: 'Interviewer'
    },
    scenario: 'You are interviewing for a Marketing Manager position. You have 5 years of experience in digital marketing.',
    startingLine: 'Hello! Thanks for coming in today. Can you start by telling me a little bit about yourself?'
  },
  {
    id: 'd4',
    title: 'Returning an Item',
    description: 'Return a defective product to a store and ask for a refund.',
    difficulty: 'B1-B2',
    roles: {
      user: 'Customer',
      ai: 'Store Clerk'
    },
    scenario: 'You bought a blender yesterday, but it doesn\'t turn on. You want to return it and get your money back. You have the receipt.',
    startingLine: 'Hi, how can I help you? Are you looking to make a return or exchange?'
  },
  {
    id: 'd5',
    title: 'Debating Remote Work',
    description: 'Have a discussion with a colleague about the pros and cons of remote work.',
    difficulty: 'C1-C2',
    roles: {
      user: 'Employee (Pro-Remote)',
      ai: 'Manager (Pro-Office)'
    },
    scenario: 'Your company is considering forcing everyone back to the office 5 days a week. You are arguing that a hybrid or remote model is better for productivity.',
    startingLine: 'I really think we need everyone back in the office full-time to improve collaboration. What are your thoughts on this?'
  }
];
