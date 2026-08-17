import { render } from "@testing-library/react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { ROUTER_HISTORY_PUSH } from "modules/routeStackHistory";
import { useRouteHistoryStack } from "./useRouteHistoryStack";

jest.mock("react-redux", () => ({ useDispatch: jest.fn() }));
jest.mock("react-router-dom", () => ({
  useHistory: jest.fn(),
  useLocation: jest.fn()
}));

const TestComponent = () => {
  useRouteHistoryStack();
  return null;
};

describe("useRouteHistoryStack", () => {
  it("registers one listener, dispatches each navigation once, and cleans up", () => {
    const dispatch = jest.fn();
    const unlisten = jest.fn();
    let listener: ((location: unknown, action: string) => void) | undefined;
    const history = {
      listen: jest.fn(callback => {
        listener = callback;
        return unlisten;
      })
    };
    const initialLocation = { pathname: "/areas" };

    (useDispatch as jest.Mock).mockReturnValue(dispatch);
    (useHistory as jest.Mock).mockReturnValue(history);
    (useLocation as jest.Mock).mockReturnValue(initialLocation);

    const view = render(<TestComponent />);
    view.rerender(<TestComponent />);

    expect(history.listen).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: ROUTER_HISTORY_PUSH, payload: initialLocation });

    const nextLocation = { pathname: "/teams" };
    listener?.(nextLocation, "PUSH");
    expect(dispatch).toHaveBeenLastCalledWith({ type: ROUTER_HISTORY_PUSH, payload: nextLocation });
    expect(dispatch).toHaveBeenCalledTimes(2);

    view.unmount();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });
});
