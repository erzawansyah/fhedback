# TODO List for FHedback Survey App

## Survey Creation
- [ ] Improve form validation and error feedback in survey creation steps
- [ ] Add conditional rendering for steps based on prerequisites (metadata, questions, publish)
- [ ] Enhance progress indicators (sidebar, color-coded status, emoji for published)
- [ ] Refactor state management in `SurveyCreationContext` for clarity and maintainability
- [ ] Add draft saving and export functionality for survey creation
- [ ] Implement edit restrictions based on submission status

## Blockchain Integration
- [ ] Handle transaction errors and loading states more robustly
- [ ] Improve smart contract interaction (factory, individual survey contracts)
- [ ] Add retry logic and better error messages for contract calls
- [ ] Optimize IPFS metadata and questions submission

## Survey Explorer & Respondent
- [ ] Add advanced search and filter options for surveys
- [ ] Display more detailed survey stats (respondent progress, rewards, ratings)
- [ ] Improve UI for survey list and detail modal (tags, creator info, time, etc.)
- [ ] Add pagination or infinite scroll for large survey lists
- [ ] Show survey status (active, completed, draft, paused) with color indicators
- [ ] Add analytics and insights for respondents and creators

## Creator Dashboard
- [ ] Add quick actions (create, view analytics, edit, delete)
- [ ] Show progress bar for active surveys
- [ ] Display more stats (total surveys, responses, spent, rating)
- [ ] Implement survey editing and deletion with confirmation dialogs

## General Improvements
- [ ] Refactor mock data to use real API/backend
- [ ] Add unit and integration tests for key components and hooks
- [ ] Improve accessibility and responsive design
- [ ] Optimize performance for large datasets
- [ ] Document key flows and components (see `SURVEY_CREATION_FLOW.md`)

## Bugs & Fixes
- [ ] Fix error handling in context and hooks (reset, clear, duplicate prevention)
- [ ] Address any UI glitches in progress bars, badges, and cards
- [ ] Ensure correct state updates on contract failures and async operations

---
*Last updated: July 28, 2025*
