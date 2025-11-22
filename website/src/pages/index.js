import React from 'react';
import Layout from '@theme/Layout';

function HomepageHeader() {
  return (
    <header className="hero hero--primary">
      <div className="container">
        <h1 className="hero__title">Bittery Protocol Documentation</h1>
        <p className="hero__subtitle">Bitcoin-native Lottery Protocol</p>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout title="Home" description="Bittery Protocol docs">
      <HomepageHeader />
    </Layout>
  );
}
