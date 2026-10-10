// «Nettside levert av» i bunnen. Ligger i bunnteksten der den finnes, ellers nederst på siden.
export function Credit({ className = "site-credit" }: { className?: string }) {
  return (
    <p className={className}>
      Nettside levert av <a href="https://xn--onlinemarkedsfring-t4b.no/">Onlinemarkedsføring.no</a>
    </p>
  );
}
