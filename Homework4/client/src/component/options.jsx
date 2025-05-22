// component/options.jsx
export default function RenderOptions({ stockList }) {
  if (!stockList || stockList.length === 0) {
    return <option value="">Loading stocks...</option>;
  }

  return (
    <>
      <option value="">Select a company...</option>
      {stockList.map((stock, index) => (
        <option key={index} value={stock}>
          {stock}
        </option>
      ))}
    </>
  );
}