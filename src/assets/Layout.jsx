import Header from "./Header";
import React from 'react'

function Layout({children}) {
  return (
    <>
    <Header />
    <main className="pt-14 md:pt-18">
        {children}
    </main>
    </>
  )
}

export default Layout