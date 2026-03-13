# CalcEmpire

An advanced, multilingual, clean, and lightning-fast engineering calculators platform. Built with TypeScript on the skeleton of React 19, Next.js, and Tailwind CSS v4.

This documentation (Developer Guide) is prepared for developers who want to create new tools on the platform and contribute to the codebase. If you are a user, check out the User Guide page, or if you are looking for proofs with formulas, check out the API/Formulas page.

## Project Setup
1. Clone the repository to your computer and navigate into the folder.
2. Install NPM packages:
   ```bash
   npm install
   ```
3. Boot up the development server and frontend engine (works without .env):
   ```bash
   npm run dev
   ```
4. Join the empire by visiting `http://localhost:3000` from your browser.

## How to Add a New Calculator (Tool)?
The project has a highly modular structure. It is very easy to code a machine and plug it into the system:

1. **Create a Component:** Navigate to an appropriate directory like `src/components/calculators/mechanical/` and create your own `MyGeniusTool.tsx` file. Build your calculation there.

2. **Create a Config File:** Create `src/lib/calculators/myGeniusTool.tsx` with your calculator configuration:
   ```ts
   import type { CalculatorConfig } from '@/types';
   
   export const myGeniusToolConfig: CalculatorConfig = {
     id: 'my-genius-tool',
     titleKey: 'MyGeniusTool.title',
     descriptionKey: 'MyGeniusTool.description',
     visual: <svg>...</svg>,
     fields: [
       { key: 'input1', labelKey: 'MyGeniusTool.input1', units: [...] },
       // ... more fields
     ],
     solverKey: 'myGeniusTool',
   };
   ```

3. **Create a Solver:** Create `src/lib/calculators/myGeniusTool.ts` with your calculation logic:
   ```ts
   import type { SolveFn, FieldValues, SolveResult } from '@/types';
   
   export const solve: SolveFn = (values: FieldValues): SolveResult => {
     // Your calculation logic here
     return { output1: result };
   };
   ```

4. **Register in Config:** Add your tool to `src/config/tools.config.ts`:
   ```ts
   { id: 'myGeniusTool', titleKey: 'myGeniusToolTitle', descKey: 'myGeniusToolDesc', catKey: 'mechanical', icon: 'M' }
   ```

5. **Register Solver:** Add your solver to `src/lib/calculators/registry.ts`:
   ```ts
   import { solve as myGeniusToolSolve } from './myGeniusTool';
   
   export const SOLVER_REGISTRY: Record<string, SolveFn> = {
     'myGeniusTool': myGeniusToolSolve,
   };
   ```

6. **Enter Multilingual (i18n) Codes:** Add your `myGeniusToolTitle` and `myGeniusToolDesc` texts into the `Dashboard` object in `src/messages/en.json` and other language files.

That's it! The smart search algorithm (Fuse.js) will automatically find your calculator in every corner of the system.

## Tests
Since this application is for engineers, there are extensive validation documents. You can run the Vitest infrastructure to confirm the accuracy of the calculators in the project locally:
```bash
npm run test
```
Vitest will output successful/unsuccessful (Pass/Fail) test reports for you via the console. The error tolerance is kept below `0.0001%`.

## Translation System (next-intl)
Translations throughout the application return via JSONs with static type support (`next-intl`). If you want to add new languages or change the texts of the application, all you have to do is update the text from `src/messages/en.json` or other language folders.

***

## DISCLAIMER
**These tools are for educational purposes.** Please be sure to consult licensed simulation software in situations requiring serious structural formulas and decisions. Otherwise, crashes/liability cannot be accepted.
