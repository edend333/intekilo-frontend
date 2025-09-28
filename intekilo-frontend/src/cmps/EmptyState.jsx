import { useNavigate } from 'react-router-dom'

export function EmptyState({ type = 'posts', user = null, variant = 'default' }) {
    const navigate = useNavigate()

    const getEmptyStateConfig = () => {
        switch (type) {
            case 'posts':
                return {
                    icon: '📸',
                    title: 'אין פוסטים עדיין',
                    subtitle: 'זה הזמן להתחיל לשתף את הרגעים שלך!',
                    actions: [
                        {
                            text: 'צור פוסט ראשון',
                            action: () => navigate('/create-post'),
                            primary: true
                        },
                        {
                            text: 'גילוי משתמשים',
                            action: () => navigate('/discover'),
                            primary: false
                        },
                        {
                            text: 'השלם פרופיל',
                            action: () => navigate('/profile/me'),
                            primary: false
                        }
                    ]
                }
            case 'profile':
                return {
                    icon: '👤',
                    title: 'פרופיל ריק',
                    subtitle: 'בוא נמלא את הפרופיל שלך בתוכן מעניין!',
                    actions: [
                        {
                            text: 'עדכן תמונת פרופיל',
                            action: () => navigate('/profile/me'),
                            primary: true
                        },
                        {
                            text: 'הוסף ביוגרפיה',
                            action: () => navigate('/profile/me'),
                            primary: false
                        }
                    ]
                }
            case 'following':
                return {
                    icon: '👥',
                    title: 'עדיין לא עוקב אחרי אף אחד',
                    subtitle: 'גלה משתמשים מעניינים ותתחיל לעקוב!',
                    actions: [
                        {
                            text: 'גילוי משתמשים',
                            action: () => navigate('/discover'),
                            primary: true
                        }
                    ]
                }
            case 'saved':
                return {
                    icon: '💾',
                    title: 'אין פוסטים שמורים עדיין',
                    subtitle: 'שמור פוסטים שאתה אוהב כדי לראות אותם כאן',
                    actions: [
                        {
                            text: 'גלה פוסטים',
                            action: () => navigate('/'),
                            primary: true
                        },
                        {
                            text: 'גילוי משתמשים',
                            action: () => navigate('/discover'),
                            primary: false
                        }
                    ]
                }
            case 'no_suggestions':
                return {
                    icon: '👥',
                    title: 'אין מספיק משתמשים להצעה כרגע 🙂',
                    subtitle: 'אפשר להתחיל מאחד הצעדים הבאים:',
                    actions: [
                        {
                            text: 'יצירת פוסט ראשון',
                            action: () => navigate('/create-post'),
                            primary: true
                        },
                        {
                            text: 'גילוי משתמשים',
                            action: () => navigate('/discover'),
                            primary: false
                        },
                        {
                            text: 'השלמת פרופיל',
                            action: () => navigate('/profile/me'),
                            primary: false
                        }
                    ]
                }
            case 'empty_feed':
                return {
                    icon: '📭',
                    title: 'הפיד עדיין ריק 🙂',
                    subtitle: 'אפשר להתחיל באחד הצעדים:',
                    actions: [
                        {
                            text: 'יצירת פוסט ראשון',
                            action: () => navigate('/create-post'),
                            primary: true
                        },
                        {
                            text: 'גילוי משתמשים',
                            action: () => navigate('/discover'),
                            primary: false
                        },
                        {
                            text: 'השלמת פרופיל',
                            action: () => navigate('/profile/me'),
                            primary: false
                        }
                    ]
                }
            default:
                return {
                    icon: '📭',
                    title: 'אין תוכן להצגה',
                    subtitle: 'בוא נתחיל ליצור משהו מעניין!',
                    actions: [
                        {
                            text: 'התחל',
                            action: () => navigate('/'),
                            primary: true
                        }
                    ]
                }
        }
    }

    const config = getEmptyStateConfig()

    return (
        <div className={`empty-state ${variant}`}>
            <div className="empty-state-content">
                <div className="empty-state-icon">
                    {config.icon}
                </div>
                
                <h3 className="empty-state-title">
                    {config.title}
                </h3>
                
                <p className="empty-state-subtitle">
                    {config.subtitle}
                </p>
                
                <div className="empty-state-actions">
                    {config.actions.map((action, index) => (
                        <button
                            key={index}
                            className={`empty-state-btn ${action.primary ? 'primary' : 'secondary'}`}
                            onClick={action.action}
                            type="button"
                        >
                            {action.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
