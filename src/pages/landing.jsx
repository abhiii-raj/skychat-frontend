import React, { useMemo, useState } from 'react'
import "../App.css"
import { useNavigate } from 'react-router-dom'
import { generateMeetingCode, normalizeMeetingCode } from '../utils/meetingCode'

export default function LandingPage() {


    const router = useNavigate();
    const [meetingCode, setMeetingCode] = useState("")
    const [showMeetMenu, setShowMeetMenu] = useState(false)

    const generatedMeetingCode = useMemo(() => generateMeetingCode('meet'), [])

    const featureCards = [
        {
            title: 'Ultra-low latency rooms',
            desc: 'Optimized signaling and transport so calls connect fast and stay stable.'
        },
        {
            title: 'Enterprise-grade controls',
            desc: 'Role access, secure rooms, and admin-ready controls for larger teams.'
        },
        {
            title: 'Actionable session analytics',
            desc: 'Track meeting quality trends, participation, and collaboration outcomes.'
        },
        {
            title: 'Built for integration',
            desc: 'Use APIs and webhooks to connect meetings with your existing workflow stack.'
        }
    ]

    const openPricing = () => {
        window.open("/pricing", "_blank", "noopener,noreferrer")
    }

    const openAuthWindow = () => {
        window.open("/auth", "_blank", "noopener,noreferrer")
    }

    const handleJoinMeeting = () => {
        const cleanCode = normalizeMeetingCode(meetingCode)
        if (!cleanCode) return
        router(`/${cleanCode}`)
        setShowMeetMenu(false)
    }

    const handleHostMeeting = () => {
        router(`/${generatedMeetingCode}`)
        setShowMeetMenu(false)
    }

    return (
        <div className='landingPageContainer'>
            <nav className='marketingNav'>
                <div className='navLeft'>
                    <div className='navHeader'>
                        <h2>Sky Chat</h2>
                    </div>
                    <div className='leftNavLinks'>
                        <button type='button' className='plainNavButton'>Products</button>
                        <button type='button' className='plainNavButton'>Solutions</button>
                        <button type='button' className='plainNavButton' onClick={openPricing}>Pricing</button>
                    </div>
                </div>

                <div className='navRight'>
                    <input
                        className='navSearch'
                        placeholder='Search'
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                    />

                    <div className='meetMenuRoot'>
                        <button type='button' className='plainNavButton' onClick={() => setShowMeetMenu((prev) => !prev)}>Meet</button>
                        {showMeetMenu ? <div className='meetDropdown'>
                            <button type='button' onClick={handleJoinMeeting}>Join Meeting</button>
                            <button type='button' onClick={handleHostMeeting}>Host Meeting</button>
                        </div> : <></>}
                    </div>

                    <button type='button' className='plainNavButton' onClick={openAuthWindow}>Sign In</button>
                    <button type='button' className='actionNavButton' onClick={openAuthWindow}>Sign Up Free</button>
                </div>
            </nav>

            <section className="landingMainContainer">
                <div className='heroLeft'>
                    <div className='heroTag'>Realtime Collaboration Platform</div>
                    <h1><span>Move faster.</span> Meet smarter.</h1>
                    <p>Sky Chat gives distributed teams a premium call experience with fast room entry, high-quality audio/video, and built-in collaboration flow.</p>
                    <div className='heroActions'>
                        <button type='button' className='heroPrimaryBtn' onClick={openAuthWindow}>Open free account</button>
                        <button type='button' className='heroGhostBtn' onClick={openPricing}>Explore pricing</button>
                    </div>
                </div>

                <div className='heroVisual'>
                    <div className='visualOrb'></div>
                    <img src="/mobile.png" alt="" />
                    <div className='heroFloatingCard'>
                        <h4>Live Room Pulse</h4>
                        <p>98.6% connection success • 32ms avg latency</p>
                    </div>
                </div>
            </section>

            <section className='landingStatsStrip'>
                <div>
                    <h3>2M+</h3>
                    <p>Calls completed</p>
                </div>
                <div>
                    <h3>99.95%</h3>
                    <p>Platform uptime</p>
                </div>
                <div>
                    <h3>120+</h3>
                    <p>Countries covered</p>
                </div>
                <div>
                    <h3>24/7</h3>
                    <p>Support availability</p>
                </div>
            </section>

            <section className='landingFeatureSection'>
                <div className='sectionHeader'>
                    <h2>Infrastructure that scales with your team</h2>
                    <p>A modern meeting stack designed for quality, reliability, and business operations.</p>
                </div>

                <div className='featureGrid'>
                    {featureCards.map((feature) => (
                        <article className='featureCard' key={feature.title}>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className='landingPricingPreview'>
                <div className='sectionHeader'>
                    <h2>Transparent pricing, built for growth</h2>
                </div>
                <div className='pricingPreviewGrid'>
                    <div className='previewPlan'>
                        <h3>Starter</h3>
                        <p className='previewPrice'>$0</p>
                        <p>Best for individuals and trial projects.</p>
                    </div>
                    <div className='previewPlan active'>
                        <h3>Business Pro</h3>
                        <p className='previewPrice'>$21.99</p>
                        <p>Advanced controls, analytics, and scaling features.</p>
                    </div>
                </div>
                <button type='button' className='heroGhostBtn' onClick={openPricing}>View full pricing comparison</button>
            </section>

            <section className='landingCtaBand'>
                <h2>Ready to upgrade your meetings?</h2>
                <p>Launch your workspace in minutes with secure rooms and production-grade reliability.</p>
                <button type='button' className='heroPrimaryBtn' onClick={openAuthWindow}>Get started</button>
            </section>

        </div>
    )
}
