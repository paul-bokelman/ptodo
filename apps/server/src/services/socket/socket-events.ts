import { confirmEvent, moveIndexEvent, getContext } from "./events";

export const socketEvents = {
  confirm: confirmEvent,
  moveIndex: moveIndexEvent,
  getContext: getContext,
};
