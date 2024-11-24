import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Info from './pages/Info'
import Home from './pages/Home'
import Chat from './pages/Chat'
import { IngredientType } from './lib/types'

const App = (): JSX.Element => {
  // logic
  const endpoint = process.env.REACT_APP_SERVER_ADDRESS

  const [ingredientList, setIngredientList] = useState<IngredientType[]>([])

  // view
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/info"
        element={<Info sendIngredientList={(data: IngredientType[]) => setIngredientList(data)} />}
      />
      <Route
        path="/chat"
        element={<Chat ingredientList={ingredientList} endpoint={endpoint || ''} />}
      />
    </Routes>
  )
}

export default App
