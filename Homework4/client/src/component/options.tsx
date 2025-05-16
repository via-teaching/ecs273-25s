interface OptionsProps {
  stockList: string[];
}

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