import React, { useMemo, useState } from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
export default function LandingPage() {


    const router = useNavigate();
    const [meetingCode, setMeetingCode] = useState("")
    const [showMeetMenu, setShowMeetMenu] = useState(false)

    const generatedMeetingCode = useMemo(() => `meet-${Math.random().toString(36).slice(2, 8)}`, [])

    const openPricing = () => {
        window.open("/pricing", "_blank", "noopener,noreferrer")
    }

    const openAuthWindow = () => {
        window.open("/auth", "_blank", "noopener,noreferrer")
    }

    const handleJoinMeeting = () => {
        const cleanCode = meetingCode.trim()
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


            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#7CF8D5" }}>Connect</span> with your loved Ones</h1>

                    <p>High quality meetings, quick room join, and a clean collaboration space.</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>

                    <img src="/mobile.png" alt="" />

                </div>
            </div>



        </div>
    )
}
