import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BadgeCheck,
    Clock3,
    Hash,
    History,
    LogOut,
    Plus,
    Search,
    Video,
} from 'lucide-react';
import withAuth from '../utils/withAuth';
import { AuthContext } from '../contexts/AuthContext';
import { generateMeetingCode, normalizeMeetingCode } from '../utils/meetingCode';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import styles from '../styles/homeDashboard.module.css';

const SKELETON_ROWS = 4;

export function HomeComponent() {
    const navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState('');
    const [recentMeetings, setRecentMeetings] = useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    const { addToUserHistory, getHistoryOfUser } = useContext(AuthContext);

    const generatedMeetingCode = useMemo(
        () => generateMeetingCode('meet'),
        []
    );

    useEffect(() => {
        let mounted = true;

        const fetchRecentMeetings = async () => {
            try {
                const history = await getHistoryOfUser();
                if (mounted) {
                    const recent = Array.isArray(history) ? history.slice(0, 6) : [];
                    setRecentMeetings(recent);
                }
            } catch (error) {
                console.error('Failed to fetch recent meetings', error);
                if (mounted) {
                    setRecentMeetings([]);
                }
            } finally {
                if (mounted) {
                    setIsLoadingRecent(false);
                }
            }
        };

        fetchRecentMeetings();

        return () => {
            mounted = false;
        };
    }, [getHistoryOfUser]);

    const handleJoinVideoCall = async () => {
        const cleanCode = normalizeMeetingCode(meetingCode);
        if (!cleanCode) return;

        try {
            await addToUserHistory(cleanCode);
        } catch (error) {
            console.error('Failed to save join history', error);
        }

        navigate(`/${cleanCode}`);
    };

    const handleStartInstantMeeting = () => {
        navigate(`/${generatedMeetingCode}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '--';
        return date.toLocaleDateString();
    };

    return (
        <div className={styles.pageShell}>
            <header className={styles.navbar}>
                <div className={styles.brandBlock}>
                    <div className={styles.brandBadge}>
                        <Video size={18} />
                    </div>
                    <div>
                        <h1 className={styles.brandTitle}>Sky Chat</h1>
                        <p className={styles.brandSubtitle}>Premium collaboration workspace</p>
                    </div>
                </div>

                <nav className={styles.navActions} aria-label="Primary actions">
                    <button
                        type="button"
                        className={`${styles.secondaryButton} ${styles.iconButton}`}
                        onClick={() => navigate('/history')}
                    >
                        <History size={18} />
                        <span>History</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.secondaryButton} ${styles.iconButton}`}
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </nav>
            </header>

            <main className={styles.dashboardWrap}>
                <section className={styles.heroCard}>
                    <div className={styles.heroIntro}>
                        <p className={styles.kicker}>Realtime Meetings</p>
                        <h2>Join a room in seconds with secure, low-latency signaling.</h2>
                        <p className={styles.mutedText}>
                            Enter a meeting code, paste a room link, or spin up a fresh session for your team.
                        </p>
                    </div>

                    <div className={styles.formCard}>
                        <label htmlFor="meetingCode" className={styles.inputLabel}>
                            Meeting code
                        </label>
                        <div className={styles.inputRow}>
                            <Search size={18} className={styles.inputIcon} />
                            <input
                                id="meetingCode"
                                className={styles.textInput}
                                type="text"
                                placeholder="Paste code or URL"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleJoinVideoCall}
                                disabled={!meetingCode.trim()}
                            >
                                Join room
                                <ArrowRight size={18} />
                            </button>

                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleStartInstantMeeting}
                            >
                                <Plus size={18} />
                                Instant room
                            </button>
                        </div>

                        <div className={styles.codeTag}>
                            <Hash size={16} />
                            <span className={styles.codeLabel}>Next quick room:</span>
                            <code>{generatedMeetingCode}</code>
                        </div>
                    </div>
                </section>

                <section className={styles.gridSection}>
                    <GlassCard className={styles.glassCard}>
                        <div className={styles.sectionHeader}>
                            <h3>Recent activity</h3>
                            <StatusBadge variant="blue">Live</StatusBadge>
                        </div>

                        <div className={styles.tableWrap}>
                            <table className={styles.activityTable}>
                                <thead>
                                    <tr>
                                        <th>Meeting ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingRecent
                                        ? Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                                            <tr key={`skeleton-${idx}`}>
                                                <td><span className={styles.skeleton} /></td>
                                                <td><span className={styles.skeleton} /></td>
                                                <td><span className={styles.skeleton} /></td>
                                            </tr>
                                        ))
                                        : recentMeetings.length > 0
                                            ? recentMeetings.map((meeting, index) => (
                                                <tr key={`${meeting.meetingCode}-${index}`}>
                                                    <td><code>{meeting.meetingCode || '--'}</code></td>
                                                    <td>{formatDate(meeting.date)}</td>
                                                    <td>
                                                        <StatusBadge variant="green">
                                                            <BadgeCheck size={16} />
                                                            Completed
                                                        </StatusBadge>
                                                    </td>
                                                </tr>
                                            ))
                                            : (
                                                <tr>
                                                    <td colSpan={3} className={styles.emptyRow}>
                                                        No meetings yet. Start your first session.
                                                    </td>
                                                </tr>
                                            )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    <GlassCard className={styles.glassCard}>
                        <div className={styles.sectionHeader}>
                            <h3>Room quality</h3>
                            <StatusBadge variant="green">Healthy</StatusBadge>
                        </div>

                        <div className={styles.metricStack}>
                            <div className={styles.metricRow}>
                                <span>Median join time</span>
                                <strong>1.2s</strong>
                            </div>
                            <div className={styles.metricRow}>
                                <span>Connection success</span>
                                <strong>99.2%</strong>
                            </div>
                            <div className={styles.metricRow}>
                                <span>Last session</span>
                                <strong className={styles.metricWithIcon}>
                                    <Clock3 size={16} />
                                    {recentMeetings[0]?.date ? formatDate(recentMeetings[0].date) : '--'}
                                </strong>
                            </div>
                        </div>
                    </GlassCard>
                </section>
            </main>

            <nav className={styles.mobileDock} aria-label="Mobile quick actions">
                <button type="button" onClick={() => navigate('/history')}>
                    <History size={18} />
                    <span>History</span>
                </button>
                <button type="button" onClick={handleStartInstantMeeting}>
                    <Plus size={18} />
                    <span>Start</span>
                </button>
                <button type="button" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
}

export default withAuth(HomeComponent);
