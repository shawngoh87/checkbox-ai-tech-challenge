import { useEffect, useState } from 'react';

const App = () => {
  // TODO: example api call, please delete this when you implement your own components/calls
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    (async () => {
      const response = await fetch('/hello');
      const { result } = await response.json();
      setMessage(result);
    })();
  });

  return <p>{message}</p>;
};

export { App };
