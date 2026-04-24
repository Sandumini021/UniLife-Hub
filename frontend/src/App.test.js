import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("Get started loads dashboard home UI", async () => {
  render(<App />);
  const user =
    typeof userEvent.setup === "function"
      ? userEvent.setup()
      : userEvent;

  expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /get started/i }));

  expect(await screen.findByText(/welcome to unilife hub/i)).toBeInTheDocument();
  expect(screen.getByText(/select a feature to continue/i)).toBeInTheDocument();
  expect(screen.getByText(/academic progress/i)).toBeInTheDocument();
  expect(screen.getByText(/expenses tracking/i)).toBeInTheDocument();
  expect(screen.getAllByText(/well-being/i).length).toBeGreaterThan(0);
});
