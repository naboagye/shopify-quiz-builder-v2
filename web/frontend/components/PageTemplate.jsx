import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export function PageTemplate({ children }) {
  return (
    <Page>
      <TitleBar title="Product Quiz Admin" primaryAction={null} />
      {children}
    </Page>
  );
}
