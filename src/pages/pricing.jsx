import React from 'react'

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
        <div className='pricingPage'>
            <div className='pricingContent'>
                <h1>Pricing Plans</h1>
                <p>Choose the plan that fits your team size and meeting needs.</p>

                <div className='pricingGrid'>
                    {plans.map((plan) => (
                        <div key={plan.name} className='pricingCard'>
                            <h2>{plan.name}</h2>
                            <p className='pricingValue'>{plan.price}</p>
                            <ul>
                                {plan.points.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
