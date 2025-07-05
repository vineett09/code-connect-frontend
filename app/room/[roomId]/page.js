"use client";

import React from "react";
import { useRoomLogic } from "../../../components/RoomPage/useRoomLogic";
import { LoadingScreen } from "../../../components/RoomPage/LoadingScreen";
import { ErrorScreen } from "../../../components/RoomPage/ErrorScreen";
import { RoomLayout } from "../../../components/RoomPage/RoomLayout";

export default function RoomPage() {
  const roomState = useRoomLogic();

  if (roomState.loading) {
    return <LoadingScreen />;
  }

  if (roomState.error) {
    return <ErrorScreen error={roomState.error} />;
  }

  return <RoomLayout {...roomState} />;
}
