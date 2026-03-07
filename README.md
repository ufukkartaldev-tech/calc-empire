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
2. **Register it in the Dashboard:** Open the `src/components/dashboard/EngineeringDashboard.tsx` file. Add your tool's unique ID (`'myGeniusTool'`) to the `ToolId` union type at the top.
3. **Place it in the Render Block:** Go to the `renderTool()` function in `EngineeringDashboard.tsx` and integrate your `<MyGeniusTool />` component into the switch-case structure.
4. **Add to Menu Array (Most Important):** Add your new tool to the array named `TOOLS_CONFIG`:
   ```ts
   { 
     id: 'myGeniusTool', 
     titleKey: 'myToolTitle', 
     descKey: 'myToolDesc', 
     catKey: 'mechanical', 
     icon: 'M' 
   }
   ```
5. **Enter Multilingual (i18n) Codes:** For the system to search, add your `myToolTitle` and `myToolDesc` texts into the `Dashboard` object in `src/messages/en.json` and other language files. That's it! The smart search algorithm (Fuse.js) will be able to search for that calculator in every corner of the system.

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
