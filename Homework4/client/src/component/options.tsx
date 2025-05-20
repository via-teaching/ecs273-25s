interface OptionsProps {
  stockList: string[];
}

// Component that renders a list of stock options for a select dropdown
export function RenderOptions({ stockList }: OptionsProps) {
  return (
    <>
      {stockList.map((stock) => (
        <option key={stock} value={stock}>
          {stock}
        </option>
      ))}
    </>
  );
}