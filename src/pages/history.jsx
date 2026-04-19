import React, { useContext, useEffect, useState } from 'react'
import { Home, CalendarDays, Hash } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import styles from '../styles/historyPage.module.css'

export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    const routeTo = useNavigate();

    useEffect(() => {
        let mounted = true;

        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                if (mounted) {
                    setMeetings(Array.isArray(history) ? history : []);
                }
            } catch {
                if (mounted) {
                    setMeetings([]);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchHistory();

        return () => {
            mounted = false;
        }
    }, [getHistoryOfUser])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div className={styles.pageShell}>
            <div className={styles.contentWrap}>
                <header className={styles.header}>
                    <button type='button' className={styles.backButton} onClick={() => routeTo('/home')}>
                        <Home size={18} />
                        <span>Back to Home</span>
                    </button>

                    <div>
                        <h1>Meeting History</h1>
                        <p>Your recently joined and hosted room timeline.</p>
                    </div>
                </header>

                <div className={styles.grid}>
                    {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                        <GlassCard key={`skeleton-${i}`} className={styles.historyCard}>
                            <div className={styles.skeletonLine}></div>
                            <div className={styles.skeletonLine}></div>
                        </GlassCard>
                    )) : meetings.length !== 0 ? meetings.map((e, i) => {
                        return (
                            <GlassCard key={i} className={styles.historyCard}>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaKey}><Hash size={16} />Code</span>
                                    <code>{e.meetingCode || '--'}</code>
                                </div>

                                <div className={styles.metaRow}>
                                    <span className={styles.metaKey}><CalendarDays size={16} />Date</span>
                                    <span>{formatDate(e.date)}</span>
                                </div>

                                <StatusBadge variant='green'>Completed</StatusBadge>
                            </GlassCard>
                        )
                    }) : <p className={styles.emptyText}>No meeting history yet.</p>}
                </div>
            </div>
        </div>
    )
}
