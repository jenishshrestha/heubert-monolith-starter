import { ThemeProvider } from "@shared/components/providers/theme";
import { Toaster } from "@shared/components/ui/Sonner";
import { TooltipProvider } from "@shared/components/ui/Tooltip";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";

import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chromatic: {
      modes: {
        light: {
          theme: "light",
          className: "light",
        },
        dark: {
          theme: "dark",
          className: "dark",
        },
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story) => (
      <div className="bg-background">
        <ThemeProvider>
          <TooltipProvider>
            <Story />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </div>
    ),
  ],
};

export default preview;
