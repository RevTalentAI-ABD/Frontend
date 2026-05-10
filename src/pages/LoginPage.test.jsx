import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { login } from "../api/api";

jest.mock("../api/api");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

beforeEach(() => jest.clearAllMocks());

describe("Rendering", () => {
  test("renders email input", () => {
    renderPage();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
  });

  test("renders password input", () => {
    renderPage();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  test("renders Sign In button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("renders all three role tabs", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Employee" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manager" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "HR Admin" })).toBeInTheDocument();
  });
});

describe("onChange Events", () => {
  test("email input updates value on change", async () => {
    renderPage();
    const emailInput = screen.getByPlaceholderText("you@company.com");
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput.value).toBe("test@example.com");
  });

  test("password input updates value on change", async () => {
    renderPage();
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await userEvent.type(passwordInput, "secret123");
    expect(passwordInput.value).toBe("secret123");
  });

  test("password field is type=password by default (hidden)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("Enter your password")).toHaveAttribute("type", "password");
  });

  test("toggle button reveals password as plain text", async () => {
    renderPage();
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    // find the toggle button (it's inside the password wrapper — only button with no text)
    const allButtons = screen.getAllByRole("button");
    const toggleBtn = allButtons.find(
      (btn) => !btn.textContent.trim() || btn.className.includes("toggle")
    );

    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("toggle button hides password again on second click", async () => {
    renderPage();
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const allButtons = screen.getAllByRole("button");
    const toggleBtn = allButtons.find(
      (btn) => !btn.textContent.trim() || btn.className.includes("toggle")
    );

    await userEvent.click(toggleBtn); // show
    await userEvent.click(toggleBtn); // hide again
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

describe("Validation - Error Messages on Invalid Input", () => {
  test("shows error when both fields are empty and Sign In is clicked", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });

  test("shows error when email is empty but password is filled", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "pass123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });

  test("shows error when password is empty but email is filled", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "user@test.com");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });

  test("shows error when email contains only whitespace", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "   ");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "pass123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });

  test("shows error when password contains only whitespace", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "   ");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });

  test("shows API error message when credentials are wrong", async () => {
    login.mockRejectedValueOnce(new Error("Invalid credentials. Please try again."));
    renderPage();
    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "bad@email.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials. Please try again.")).toBeInTheDocument()
    );
  });

  test("shows generic error if API throws without a message", async () => {
    login.mockRejectedValueOnce({});
    renderPage();
    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "pass123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials. Please try again.")).toBeInTheDocument()
    );
  });
});

describe("Successful Login - Navigation by Role", () => {
  const fillAndSubmit = async (email, password) => {
    await userEvent.type(screen.getByPlaceholderText("you@company.com"), email);
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), password);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  };

  test("navigates to /employee-dashboard for EMPLOYEE", async () => {
    login.mockResolvedValueOnce({ token: "tok", role: "EMPLOYEE", name: "Alice" });
    renderPage();
    await fillAndSubmit("emp@co.com", "pass123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/employee-dashboard"));
  });

  test("navigates to /managerdashboard for MANAGER", async () => {
    login.mockResolvedValueOnce({ token: "tok", role: "MANAGER", name: "Bob" });
    renderPage();
    await fillAndSubmit("mgr@co.com", "pass123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/managerdashboard"));
  });

  test("navigates to /hr-dashboard for HR_ADMIN", async () => {
    login.mockResolvedValueOnce({ token: "tok", role: "HR_ADMIN", name: "Carol" });
    renderPage();
    await fillAndSubmit("hr@co.com", "pass123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/hr-dashboard"));
  });

  test("shows error for unknown role", async () => {
    login.mockResolvedValueOnce({ token: "tok", role: "UNKNOWN", name: "Ghost" });
    renderPage();
    await fillAndSubmit("x@co.com", "pass123");
    await waitFor(() =>
      expect(screen.getByText("Unknown role. Contact admin.")).toBeInTheDocument()
    );
  });
});

describe("Role Tab Switching", () => {
  test("Employee tab is active by default", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Employee" })).toHaveClass("active");
  });

  test("clicking Manager makes it active", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Manager" }));
    expect(screen.getByRole("button", { name: "Manager" })).toHaveClass("active");
  });

  test("clicking HR Admin makes it active", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "HR Admin" }));
    expect(screen.getByRole("button", { name: "HR Admin" })).toHaveClass("active");
  });
});

describe("Keyboard - Enter key triggers submit", () => {
  test("pressing Enter on email field shows error if fields are empty", () => {
    renderPage();
    fireEvent.keyDown(screen.getByPlaceholderText("you@company.com"), {
      key: "Enter",
      code: "Enter",
    });
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });

  test("pressing Enter on password field shows error if fields are empty", () => {
    renderPage();
    fireEvent.keyDown(screen.getByPlaceholderText("Enter your password"), {
      key: "Enter",
      code: "Enter",
    });
    expect(screen.getByText("Please enter email and password.")).toBeInTheDocument();
  });


});

