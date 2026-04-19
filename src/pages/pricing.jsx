import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import styles from '../styles/pricingPage.module.css'

const plans = [
    {
        name: 'Basic',
        price: '$0 / month',
        points: ['Up to 40 min meetings', '100 participant limit', 'Chat and screen share']
    },
    {
        name: 'Pro',
        price: '$14.99 / month',
        points: ['Meetings up to 30 hours', 'Cloud recordings', 'Advanced reporting']
    },
    {
        name: 'Business',
        price: '$21.99 / month',
        points: ['300 participant capacity', 'SSO and admin controls', 'Branding options']
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        points: ['Unlimited scale options', 'Dedicated success manager', 'Advanced security and compliance']
    }
]

export default function PricingPage() {
    return (
        <div className={styles.pageShell}>
            <div className={styles.pricingContent}>
                <h1>Simple, honest fees.</h1>
                <p>Choose the plan that matches your team velocity and collaboration scale.</p>

                <div className={styles.pricingGrid}>
                    {plans.map((plan) => (
                        <GlassCard key={plan.name} className={styles.pricingCard}>
                            <h2>{plan.name}</h2>
                            <p className={styles.pricingValue}>{plan.price}</p>
                            <ul>
                                {plan.points.map((point) => (
                                    <li key={point}>
                                        <CheckCircle2 size={16} />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                            <StatusBadge variant={plan.name === 'Enterprise' ? 'blue' : 'green'}>
                                {plan.name === 'Enterprise' ? 'Custom onboarding' : 'Ready to deploy'}
                            </StatusBadge>
                        </GlassCard>
                    ))}
                </div>

                <div className={styles.pricingTableWrap}>
                    <table className={styles.pricingTable}>
                        <thead>
                            <tr>
                                <th>Capability</th>
                                <th>Basic</th>
                                <th>Pro</th>
                                <th>Business</th>
                                <th>Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Participant limit</td>
                                <td>100</td>
                                <td>150</td>
                                <td>300</td>
                                <td>Custom</td>
                            </tr>
                            <tr>
                                <td>Cloud recording</td>
                                <td>No</td>
                                <td>Yes</td>
                                <td>Yes</td>
                                <td>Yes</td>
                            </tr>
                            <tr>
                                <td>SSO and advanced policy</td>
                                <td>No</td>
                                <td>No</td>
                                <td>Yes</td>
                                <td>Yes</td>
                            </tr>
                            <tr>
                                <td>Dedicated support</td>
                                <td>No</td>
                                <td>Email</td>
                                <td>Priority</td>
                                <td>24/7 + TAM</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
