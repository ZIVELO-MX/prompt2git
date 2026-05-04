// Layout protegido — el middleware ya validó la sesión antes de llegar aquí

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
