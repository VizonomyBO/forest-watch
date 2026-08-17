import { ROUTER_HISTORY_PUSH } from "modules/routeStackHistory";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

export const useRouteHistoryStack = () => {
  //this hook is meant to used once in the main routes file to keep track of routes history
  const history = useHistory<any>();
  const dispatch = useDispatch();
  const location = useLocation();
  const initialLocation = useRef(location);

  useEffect(() => {
    dispatch({ type: ROUTER_HISTORY_PUSH, payload: initialLocation.current });

    const unlisten = history.listen((nextLocation, action) =>
      dispatch({ type: `routeHistory/${action}`, payload: nextLocation })
    );

    return unlisten;
  }, [dispatch, history]);
};
