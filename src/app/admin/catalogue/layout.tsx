import styles from "./catalogue-workspace.module.css";

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.workspace} data-testid="catalogue-workspace"><main className={styles.content}>{children}</main></div>;
}
