import Header from "./Header";
import React from 'react'

function Layout({children}) {
  return (
    <>
    <Header />
    <main className="pt-16">
        {children}
    </main>
    </>
  )
}

export default Layout