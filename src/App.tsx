import React, { useEffect, useState } from 'react';
import UploadForm from './components/UploadForm';
import SoundbyteSearch from './components/SoundbyteSearch';

export enum Window {
  Main = "main",
  SearchOverlay = "search"
}

function parseRoute(route?: string | null): Window {
  if (route === Window.Main) return Window.Main;
  if (route === Window.SearchOverlay) return Window.SearchOverlay;
  return Window.Main; // fallback
}

export default function App() {
  const [route, setRoute] = useState<Window>(Window.Main);

  // Extract route from query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRoute(parseRoute(params.get('route')));
  }, [])

  return (
    <>
      {route === Window.Main ? <UploadForm /> : <SoundbyteSearch />}
    </>
  );
}
