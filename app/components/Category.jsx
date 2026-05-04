'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ArrowLeft } from './Icons'
import multishop from '@p/Logo Sistema Multishop Pequeno.png'
import FooterGraph from './Footer'
import {
  Financial,
  Operative,
  Statistical,
  Sun,
  Moon,
  ReloadIcon // Importamos el icono de carga
} from './Icons'

export default function Category() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Nuevo estado para la carga
  const router = useRouter()

  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory')
    if (savedCategory) {
      setSelectedCategory(savedCategory)
    }

    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("darkMode", JSON.stringify(newMode))
  }


  const handleCategoryClick = (category) => {
    localStorage.setItem('selectedCategory', category)
    setSelectedCategory(category)
    setIsLoading(true)

    setTimeout(() => {
      router.push({
        pathname: '/listkpi',
        query: { category }
      })
    }, 1000)
  }

  const backRouter = (e) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      router.push('/date')
    }, 1000)
  }

  return (
    <div className="body">
      <div className="calendar">
        <div className="nav">
          <div className="logo-small">
            <Image
              src={multishop}
              className="mutishop"
              alt="Logo de Multishop"
            />
          </div>
          <div className="mood">
            <button
              className={`mood-btn ${darkMode ? "dark" : ""}`}
              onClick={toggleDarkMode}
            >
              <Sun className="icon" />
              <div className="circle2"></div>
              <Moon className="icon" />
            </button>
          </div>
        </div>

        <div className="container-ca">
          <div className="title-ca">
            <h1>Selecciona la categoría</h1>
          </div>

          <div className="row-ca">
            <div
              className={`categoria ${selectedCategory === 'Financieros' ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
              onClick={() => !isLoading && handleCategoryClick('Financieros')}
            >
              <Financial />
              <span className='ca-ti'>Análisis Financiero</span>
            </div>
            <div
              className={`categoria ${selectedCategory === 'Operativos' ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
              onClick={() => !isLoading && handleCategoryClick('Operativos')}
            >
              <Operative />
              <span className='ca-ti'>Análisis Operativo</span>
            </div>
            <div
              className={`categoria ${selectedCategory === 'Estadísticos' ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
              onClick={() => !isLoading && handleCategoryClick('Estadísticos')}
            >
              <Statistical />
              <span className='ca-ti'>Análisis Estadístico</span>
            </div>
          </div>

          <div className="button__graph">
            <button className='btn' onClick={backRouter} disabled={isLoading}>
              <ArrowLeft></ArrowLeft>
              <span>Atrás</span>
            </button>
          </div>
        </div>

        <FooterGraph />

        {/* AJUSTE: Visualización del loader */}
        {isLoading && (
          <div className="modal-login-loading">
            <ReloadIcon className="icon-loading" />
          </div>
        )}
      </div>
    </div>
  )
}