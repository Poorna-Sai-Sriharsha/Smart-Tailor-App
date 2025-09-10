// React Components
const { useState, useEffect, useMemo, useRef } = React;

const GARMENT_PRICES = {
    'Shirt': 1500,
    'Pants': 2000,
    'Blazer': 7500,
    'Suit': 12000,
    'Dress': 4000,
    'Skirt': 1800,
    'Other': 3000
};

const DELIVERY_FEE = 150;
const COUPON_CODE = "FESTIVE20";

// Reusable Modal Component
function Modal({ children, onClose, title }) {
    return ReactDOM.createPortal(
        React.createElement('div', { className: 'modal-backdrop', onClick: onClose },
            React.createElement('div', { className: 'modal-content', onClick: e => e.stopPropagation() },
                React.createElement('button', { className: 'modal-close-btn', onClick: onClose }, '×'),
                React.createElement('h2', { className: 'modal-title' }, title),
                children
            )
        ),
        document.body
    );
}

// Notification Component
function Notification({ message, isError, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        
        return () => clearTimeout(timer);
    }, [onClose]);
    
    return React.createElement('div', {
        className: `notification ${isError ? 'error' : ''} show`
    }, 
        React.createElement('i', { 
            className: isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle' 
        }),
        ` ${message}`
    );
}

// Login Page Component
function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: '', isError: false });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            showNotificationMessage('Please enter both email and password', true);
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotificationMessage('Please enter a valid email address', true);
            return;
        }
        
        if (email === 'customer@demo.com' && password === 'demo123') {
            showNotificationMessage('Login successful! Redirecting to customer dashboard...');
            setTimeout(() => onLogin('customer'), 1500);
        } 
        else if (email === 'tailor@demo.com' && password === 'demo123') {
            showNotificationMessage('Login successful! Redirecting to tailor dashboard...');
            setTimeout(() => onLogin('tailor'), 1500);
        }
        else {
            showNotificationMessage('Invalid email or password. Try customer@demo.com / demo123 or tailor@demo.com / demo123', true);
        }
    };
    
    const showNotificationMessage = (message, isError = false) => {
        setNotification({ message, isError });
        setShowNotification(true);
    };
    
    const closeNotification = () => {
        setShowNotification(false);
    };
    
    return React.createElement('div', { className: 'page active' },
        React.createElement('div', { className: 'login-container' },
            React.createElement('div', { className: 'login-card' },
                React.createElement('div', { className: 'logo' },
                    React.createElement('i', { className: 'fas fa-shirt' }),
                    React.createElement('h1', null, 'SmartTailor'),
                    React.createElement('p', null, 'Digitally Augmented Tailoring Workflow Management')
                ),
                
                React.createElement('div', { className: 'login-header' },
                    React.createElement('h2', null, 'Welcome Back'),
                    React.createElement('p', null, 'Sign in to access your account')
                ),
                
                React.createElement('form', { onSubmit: handleSubmit },
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'email' }, 'Email Address'),
                        React.createElement('div', { className: 'input-with-icon' },
                            React.createElement('i', { className: 'fas fa-envelope input-icon' }),
                            React.createElement('input', {
                                type: 'email',
                                className: 'form-control',
                                id: 'email',
                                placeholder: 'name@example.com',
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                required: true
                            })
                        )
                    ),
                    
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'password' }, 'Password'),
                        React.createElement('div', { className: 'input-with-icon' },
                            React.createElement('i', { className: 'fas fa-lock input-icon' }),
                            React.createElement('input', {
                                type: 'password',
                                className: 'form-control',
                                id: 'password',
                                placeholder: 'Enter your password',
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                required: true
                            })
                        )
                    ),
                    
                    React.createElement('button', { type: 'submit', className: 'login-btn' }, 'Sign In')
                ),
                
                React.createElement('div', { className: 'demo-accounts' },
                    React.createElement('h3', null, 'Demo Accounts'),
                    React.createElement('div', { className: 'demo-account' },
                        React.createElement('div', { className: 'role' }, 'Customer Account'),
                        React.createElement('div', { className: 'credentials' }, 'customer@demo.com / demo123')
                    ),
                    React.createElement('div', { className: 'demo-account' },
                        React.createElement('div', { className: 'role' }, 'Tailor Account'),
                        React.createElement('div', { className: 'credentials' }, 'tailor@demo.com / demo123')
                    )
                )
            )
        ),
        
        showNotification && React.createElement(Notification, {
            message: notification.message,
            isError: notification.isError,
            onClose: closeNotification
        })
    );
}
// Customer Dashboard Component
function CustomerDashboard({ onLogout, allOrders, setAllOrders, appointments, setAppointments, customerNotification, setCustomerNotification }) {
    const [showForm, setShowForm] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: '', isError: false });
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState(null);
    const [newOrderDetails, setNewOrderDetails] = useState({ price: 0, deliveryFee: 0, garmentType: '' });
    const [discardedOrderInfo, setDiscardedOrderInfo] = useState(null);
    const activeOrders = useMemo(() => allOrders.filter(o => o.customer === 'Sarah Chen' && !['completed', 'delivered'].includes(o.status)), [allOrders]);
    
    const orderHistory = useMemo(() => 
        allOrders
            .filter(o => o.customer === 'Sarah Chen' && ['completed', 'delivered'].includes(o.status))
            .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
            .slice(0, 5),
        [allOrders]
    );
    
    useEffect(() => {
        if (customerNotification) {
            setNotification(customerNotification);
            setShowNotification(true);
            setCustomerNotification(null);
        }
    }, [customerNotification]);
    useEffect(() => {
        const alertData = localStorage.getItem('discardedOrderAlert');
        if (alertData) {
            try {
                const orderInfo = JSON.parse(alertData);
                if (orderInfo.customer === 'Sarah Chen') {
                    setDiscardedOrderInfo(orderInfo);
                }
                localStorage.removeItem('discardedOrderAlert'); 
            } catch (e) {
                localStorage.removeItem('discardedOrderAlert');
            }
        }
    }, []);
    const handleOrderSubmit = (orderData) => {
        const newOrder = {
            id: Math.max(0, ...allOrders.map(o => o.id)) + 1,
            ...orderData,
            status: 'new',
            progress: 10,
            price: newOrderDetails.price + (orderData.deliveryType === 'home' ? DELIVERY_FEE : 0),
            paymentStatus: 'pending',
            rating: null,
            reviewText: '',
            customer: 'Sarah Chen'
        };
        setAllOrders(prevOrders => [newOrder, ...prevOrders]);
        setShowForm(false);
        setNewOrderDetails({ price: 0, deliveryFee: 0, garmentType: '' });
        showNotificationMessage('Order request submitted successfully!');
    };
    const handleRequestDelivery = (order) => {
        if (order.paymentStatus !== 'paid') {
            setDeliveryOrder(null);
            showNotificationMessage('Payment must be completed before requesting delivery.', true);
            return;
        }
        const updatedOrder = { ...order, status: 'delivery' };
        setAllOrders(allOrders.map(o => o.id === order.id ? updatedOrder : o));
        setDeliveryOrder(null);
        showNotificationMessage(`Home delivery requested for Order #${order.id}.`);
    };
    
    const showNotificationMessage = (message, isError = false) => {
        setNotification({ message, isError });
        setShowNotification(true);
    };
    
    const handleViewDetails = (orderId) => {
        const orderToShow = allOrders.find(o => o.id === orderId);
        setSelectedOrder(orderToShow);
    };
    
    const handleContactTailor = () => setIsContactModalOpen(true);
    const handleRescheduleSave = (appointmentId, newDate, newTime) => {
        const newDateTime = new Date(`${newDate}T${newTime}`);
        setAppointments(
            appointments.map(app =>
                app.id === appointmentId ? { ...app, date: newDateTime.toISOString() } : app
            )
        );
        setRescheduleAppointment(null);
        showNotificationMessage("Appointment rescheduled successfully!");
    };
    const handleAddToCalendar = (appointment) => {
        const title = encodeURIComponent(appointment.type);
        const startTime = new Date(appointment.date).toISOString().replace(/-|:|\.\d+/g, '');
        const endTime = new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
        const details = encodeURIComponent(`Appointment for ${appointment.type} at ${appointment.location}`);
        const location = encodeURIComponent(appointment.location);
        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
        window.open(googleCalendarUrl, '_blank');
    };
    const handlePayment = (orderId) => {
        setAllOrders(allOrders.map(o => o.id === orderId ? {...o, paymentStatus: 'paid'} : o));
        showNotificationMessage(`Payment for Order #${orderId} successful!`);
    }
    const handleReviewSubmit = (orderId, rating, reviewText) => {
        setAllOrders(allOrders.map(o => o.id === orderId ? {...o, rating, reviewText} : o));
        setReviewingOrder(null);
        showNotificationMessage("Thank you for your review!");
    };
    
    return React.createElement('div', { className: 'page active' },
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'dashboard-header' },
                React.createElement('div', { className: 'dashboard-logo' }, React.createElement('i', { className: 'fas fa-shirt' }), React.createElement('span', null, 'SmartTailor')),
                React.createElement('div', { className: 'nav-buttons' }, React.createElement('span', { style: { marginRight: '10px' } }, 'Welcome, Sarah!'), React.createElement('button', { className: 'btn btn-danger', onClick: onLogout }, 'Logout'))
            ),
            React.createElement('div', { className: 'dashboard-grid' },
                React.createElement('div', null,
                    React.createElement('div', { className: 'card' },
                        React.createElement('div', { className: 'card-title' },
                            React.createElement('span', null, 'My Active Orders'),
                            React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setShowForm(!showForm) }, showForm ? 'Cancel Order' : 'New Order')
                        ),
                        showForm && React.createElement(StitchingForm, { onUpdate: setNewOrderDetails, onSubmit: handleOrderSubmit }),
                        !showForm && (activeOrders.length > 0 ? activeOrders.map(order => React.createElement(OrderCard, { key: order.id, order: order, onViewDetails: handleViewDetails, onContactTailor: handleContactTailor, onHomeDelivery: setDeliveryOrder, onLeaveReview: setReviewingOrder })) : React.createElement('p', null, "You have no active orders."))
                    ),
                    React.createElement('div', { className: 'card' }, React.createElement('div', { className: 'card-title' }, 'My Measurements'), React.createElement(MeasurementDiagram, null))
                ),
                React.createElement('div', null,
                    React.createElement('div', { className: 'card' },
                        React.createElement('div', { className: 'card-title' }, 'Upcoming Appointments'),
                        appointments.filter(a => a.customer === 'Sarah Chen').map(app => React.createElement(AppointmentCard, { key: app.id, appointment: app, onReschedule: () => setRescheduleAppointment(app), onAddToCalendar: () => handleAddToCalendar(app) }))
                    ),
                    !showForm && React.createElement(React.Fragment, null,
                        React.createElement('div', { className: 'card' }, React.createElement('div', { className: 'card-title' }, 'Special Offers'), React.createElement(SpecialOffer, { onShowOffer: () => setIsOfferModalOpen(true) })),
                        React.createElement(PaymentCard, { orderDetails: newOrderDetails, onPay: handlePayment, orders: allOrders.filter(o => o.customer === 'Sarah Chen') })
                    )
                )
            ),
            
            React.createElement('div', { className: 'card' }, 
                React.createElement('div', { className: 'card-title' }, 'Order History'), 
                React.createElement(OrderHistoryTable, { 
                    orderHistory: orderHistory, 
                    onLeaveReview: setReviewingOrder 
                })
            )
        ),
        React.createElement(Chatbot),
        showNotification && React.createElement(Notification, { message: notification.message, isError: notification.isError, onClose: () => setShowNotification(false) }),
        
        discardedOrderInfo && React.createElement(Modal, {
            title: "Order Cancellation Notice",
            onClose: () => setDiscardedOrderInfo(null)
        },
            React.createElement('p', {style:{marginBottom: '15px'}}, "We're sorry, but your following order has been cancelled by the tailor:"),
            React.createElement('div', { className: 'detail-row' }, 
                React.createElement('span', null, React.createElement('strong', null, 'Order ID:')), 
                React.createElement('span', null, `#ST-${discardedOrderInfo.id}`)
            ),
            React.createElement('div', { className: 'detail-row' }, 
                React.createElement('span', null, React.createElement('strong', null, 'Item:')), 
                React.createElement('span', null, discardedOrderInfo.garmentType)
            )
        ),
        selectedOrder && React.createElement(Modal, { title: `Details for Order #ST-${selectedOrder.id}`, onClose: () => setSelectedOrder(null) },
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Item:')), React.createElement('span', null, selectedOrder.garmentType)),
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Fabric:')), React.createElement('span', null, selectedOrder.fabricType)),
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Status:')), React.createElement('span', null, selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1))),
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Due Date:')), React.createElement('span', null, formatDate(selectedOrder.dueDate))),
            React.createElement('p', {style: {marginTop: '15px'}}, 'Further details and communication history would appear here.')
        ),
        isContactModalOpen && React.createElement(Modal, { title: "Contact Your Tailor", onClose: () => setIsContactModalOpen(false) },
                        React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Name:')), React.createElement('span', null, 'Master Stitch')),
                        React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Phone:')), React.createElement('span', null, '+91-9876543210')),
            React.createElement('p', {style: {marginTop: '15px'}}, 'Feel free to call for any inquiries regarding your order.')
        ),
        rescheduleAppointment && React.createElement(RescheduleModal, { appointment: rescheduleAppointment, onSave: handleRescheduleSave, onClose: () => setRescheduleAppointment(null) }),
        deliveryOrder && React.createElement(Modal, { title: "Request Home Delivery", onClose: () => setDeliveryOrder(null) },
            React.createElement('p', null, `An extra charge of ₹150 will be applied for home delivery of Order #${deliveryOrder.id}.`),
            React.createElement('p', { style: { marginBottom: '20px' } }, 'Do you wish to proceed?'),
            React.createElement('button', { className: 'btn btn-primary', style: { width: '100%'}, onClick: () => handleRequestDelivery(deliveryOrder) }, 'Confirm Home Delivery (₹150)')
        ),
        isOfferModalOpen && React.createElement(Modal, { title: "Festival Special Offer", onClose: () => setIsOfferModalOpen(false) },
            React.createElement('p', null, `Get 20% off your next order with coupon code:`),
            React.createElement('h3', { style: { textAlign: 'center', margin: '15px 0', color: 'var(--primary)'} }, COUPON_CODE),
            React.createElement('button', { className: 'btn btn-sm btn-primary', style: {width: '100%'}, onClick: () => {
                navigator.clipboard.writeText(COUPON_CODE);
                showNotificationMessage("Coupon code copied!");
            }}, 'Copy Code')
        ),
        reviewingOrder && React.createElement(ReviewModal, { order: reviewingOrder, onSubmit: handleReviewSubmit, onClose: () => setReviewingOrder(null) })
    );
}
// Order Card Component
function OrderCard({ order, onViewDetails, onContactTailor, onHomeDelivery, onLeaveReview }) {
    const statusMap = { 'new': { text: 'New Order', class: 'status-new' }, 'progress': { text: 'In Progress', class: 'status-progress' }, 'ready': { text: 'Trial Ready', class: 'status-ready' }, 'completed': { text: 'Completed', class: 'status-completed' }, 'delivery': { text: 'Awaiting Home Delivery', class: 'status-delivery' }, 'delivered': { text: 'Delivered', class: 'status-completed' }};
    const statusInfo = statusMap[order.status] || { text: 'Unknown', class: '' };
    const getTimelineBadgeClass = (stepProgress, stepStatusArray = []) => {
        if (stepStatusArray.includes(order.status)) return 'timeline-completed';
        if (order.progress >= stepProgress) return 'timeline-completed';
        return '';
    };
    
    return React.createElement('div', { className: 'order-card card' },
        React.createElement('div', { className: 'order-header' },
            React.createElement('div', { className: 'order-id' }, `Order #ST-${order.id}`),
            React.createElement('div', { className: `order-status ${statusInfo.class}` }, statusInfo.text)
        ),
        React.createElement('div', { className: 'order-details' },
            React.createElement('p', null, React.createElement('strong', null, 'Item:'), ` ${order.garmentType}`),
            React.createElement('p', null, React.createElement('strong', null, 'Fabric:'), ` ${order.fabricType}`),
            React.createElement('p', null, React.createElement('strong', null, 'Delivery Due:'), ` ${formatDate(order.dueDate)}`)
        ),
        React.createElement('div', { className: 'progress-bar' }, React.createElement('div', { className: 'progress-fill', style: { width: `${order.progress}%` } })),
        React.createElement('div', { className: 'timeline' },
            React.createElement('div', { className: 'timeline-step' }, React.createElement('div', { className: `timeline-badge ${getTimelineBadgeClass(10)}`}, '1'), React.createElement('div', { className: 'timeline-label' }, 'Confirmed')),
            React.createElement('div', { className: 'timeline-step' }, React.createElement('div', { className: `timeline-badge ${getTimelineBadgeClass(25)}`}, '2'), React.createElement('div', { className: 'timeline-label' }, 'Cutting')),
            React.createElement('div', { className: 'timeline-step' }, React.createElement('div', { className: `timeline-badge ${getTimelineBadgeClass(75)}`}, '3'), React.createElement('div', { className: 'timeline-label' }, 'Stitching')),
            React.createElement('div', { className: 'timeline-step' }, React.createElement('div', { className: `timeline-badge ${getTimelineBadgeClass(100, ['completed', 'delivery', 'delivered'])}`}, React.createElement('i', {className: 'fas fa-box-open'})), React.createElement('div', { className: 'timeline-label' }, 'Ready')),
            React.createElement('div', { className: 'timeline-step' }, React.createElement('div', { className: `timeline-badge ${order.paymentStatus === 'paid' ? 'timeline-completed' : ''}`}, React.createElement('i', {className: 'fas fa-check'})), React.createElement('div', { className: 'timeline-label' }, 'Paid')),
            React.createElement('div', { className: 'timeline-step' }, React.createElement('div', { className: `timeline-badge ${getTimelineBadgeClass(100, ['delivery', 'delivered'])}`}, React.createElement('i', {className: 'fas fa-truck'})), React.createElement('div', { className: 'timeline-label' }, 'Delivery'))
        ),
        React.createElement('div', { className: 'action-buttons' },
            React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => onViewDetails(order.id)}, 'View Details'),
            React.createElement('button', { className: 'btn btn-sm', style: { background: '#E9ECEF' }, onClick: () => onContactTailor(order.id)}, 'Contact Tailor'),
            order.status === 'completed' && React.createElement('button', { className: 'btn btn-success btn-sm', onClick: () => onHomeDelivery(order)}, 'Request Home Delivery'),
            order.status === 'delivered' && order.paymentStatus === 'paid' && !order.rating && React.createElement('button', { className: 'btn btn-warning btn-sm', onClick: () => onLeaveReview(order)}, 'Leave a Review')
        )
    );
}
// Measurement Diagram Component
function MeasurementDiagram() {
    const [measurements, setMeasurements] = useState({ shoulder: 18, waist: 32, hip: 38, chest: 40 });
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const handleSaveMeasurements = (newMeasurements) => {
        setMeasurements(newMeasurements);
        setIsUpdateModalOpen(false);
    };
    // This component generates a male silhouette using SVG path data.
    const MaleSilhouetteSVG = () => {
        return React.createElement('svg', {
            width: "150",
            height: "250",
            viewBox: "0 0 150 250",
            style: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                height: '100%',
                width: 'auto'
            }
        },
            React.createElement('path', {
                // Updated path data for a more defined waist and hip
                d: "M75,10 C55,10 45,25 45,40 L55,55 C35,60 5,65 5,90 C5,120 30,130 35,160 L40,240 L110,240 L115,160 C120,130 145,120 145,90 C145,65 115,60 95,55 L105,40 C105,25 95,10 75,10 Z",
                fill: "#D6E4FF",
                stroke: "#AABBE5",
                strokeWidth: "2"
            })
        );
    };
    return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'measurement-diagram' },
            React.createElement(MaleSilhouetteSVG, null),
            // Shoulder Annotation: Measurement across the top from shoulder point to shoulder point.
            React.createElement('div', { className: 'measurement-annotation', style: { top: '60px', right: '5px', flexDirection: 'row-reverse' } },
                React.createElement('div', { className: 'measurement-label' }, 'Shoulder'),
                React.createElement('div', { className: 'measurement-line', style: { width: '35px' } }),
                React.createElement('div', { className: 'measurement-point' }, measurements.shoulder)
            ),
            // Chest Annotation: Measurement around the fullest part of the chest.
            React.createElement('div', { className: 'measurement-annotation', style: { top: '90px', left: '15px' } },
                React.createElement('div', { className: 'measurement-label' }, 'Chest'),
                React.createElement('div', { className: 'measurement-line', style: { width: '40px' } }),
                React.createElement('div', { className: 'measurement-point' }, measurements.chest)
            ),
            // Waist Annotation: Measurement around the natural waistline (narrowest part of the torso).
            React.createElement('div', { className: 'measurement-annotation', style: { top: '140px', right: '15px', flexDirection: 'row-reverse' } },
                React.createElement('div', { className: 'measurement-label' }, 'Waist'),
                React.createElement('div', { className: 'measurement-line', style: { width: '50px' } }),
                React.createElement('div', { className: 'measurement-point' }, measurements.waist)
            ),
            // Hip Annotation: Measurement around the fullest part of the hips.
            React.createElement('div', { className: 'measurement-annotation', style: { top: '175px', left: '25px' } },
                React.createElement('div', { className: 'measurement-label' }, 'Hip'),
                React.createElement('div', { className: 'measurement-line', style: { width: '45px' } }),
                React.createElement('div', { className: 'measurement-point' }, measurements.hip)
            )
        ),
        React.createElement('div', { className: 'measurement-detail' },
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, 'Shoulder'), React.createElement('span', null, `${measurements.shoulder} inches`)),
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, 'Chest'), React.createElement('span', null, `${measurements.chest} inches`)),
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, 'Waist'), React.createElement('span', null, `${measurements.waist} inches`)),
            React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, 'Hip'), React.createElement('span', null, `${measurements.hip} inches`))
        ),
        React.createElement('div', { className: 'action-buttons' }, React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setIsUpdateModalOpen(true) }, 'Update Measurements')),
        isUpdateModalOpen && React.createElement(UpdateMeasurementsModal, { currentMeasurements: measurements, onSave: handleSaveMeasurements, onClose: () => setIsUpdateModalOpen(false) })
    );
}
// Update Measurements Modal Component
function UpdateMeasurementsModal({ currentMeasurements, onSave, onClose }) {
    const [tempMeasurements, setTempMeasurements] = useState(currentMeasurements);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempMeasurements(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(tempMeasurements);
    };
    return React.createElement(Modal, { title: "Update Your Measurements", onClose: onClose },
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'form-row' },
                React.createElement('div', { className: 'form-field' }, React.createElement('label', { htmlFor: 'shoulder' }, 'Shoulder (inches)'), React.createElement('input', { type: 'number', id: 'shoulder', name: 'shoulder', value: tempMeasurements.shoulder, onChange: handleChange, step: '0.1' })),
                React.createElement('div', { className: 'form-field' }, React.createElement('label', { htmlFor: 'chest' }, 'Chest (inches)'), React.createElement('input', { type: 'number', id: 'chest', name: 'chest', value: tempMeasurements.chest, onChange: handleChange, step: '0.1' }))
            ),
            React.createElement('div', { className: 'form-row' },
                React.createElement('div', { className: 'form-field' }, React.createElement('label', { htmlFor: 'waist' }, 'Waist (inches)'), React.createElement('input', { type: 'number', id: 'waist', name: 'waist', value: tempMeasurements.waist, onChange: handleChange, step: '0.1' })),
                React.createElement('div', { className: 'form-field' }, React.createElement('label', { htmlFor: 'hip' }, 'Hip (inches)'), React.createElement('input', { type: 'number', id: 'hip', name: 'hip', value: tempMeasurements.hip, onChange: handleChange, step: '0.1' }))
            ),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', marginTop: '10px' } }, 'Save Changes')
        )
    );
}
// Appointment Card Component
function AppointmentCard({ appointment, onReschedule, onAddToCalendar }) {
    const { type, date, location, gradient } = appointment;
    const formattedDate = new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    return React.createElement('div', { className: 'appointment-card', style: { background: gradient }},
        React.createElement('p', null, React.createElement('i', { className: type.includes('Fitting') ? 'fas fa-calendar-alt' : 'fas fa-tshirt' }), React.createElement('strong', null, ` ${type}`)),
        React.createElement('p', null, formattedDate),
        React.createElement('p', null, location),
        React.createElement('div', { className: 'action-buttons' },
            React.createElement('button', { className: 'btn btn-sm', style: { background: 'rgba(255,255,255,0.3)' }, onClick: onReschedule }, 'Reschedule'),
            React.createElement('button', { className: 'btn btn-sm', style: { background: 'rgba(255,255,255,0.3)' }, onClick: onAddToCalendar }, 'Add to Calendar')
        )
    );
}
// Reschedule Modal
function RescheduleModal({ appointment, onSave, onClose }) {
    const initialDate = new Date(appointment.date);
    const [date, setDate] = useState(initialDate.toISOString().split('T')[0]);
    const [time, setTime] = useState(initialDate.toTimeString().substring(0, 5));
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(appointment.id, date, time);
    };
    return React.createElement(Modal, { title: `Reschedule: ${appointment.type}`, onClose: onClose },
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'form-row' },
                React.createElement('div', { className: 'form-field' }, React.createElement('label', { htmlFor: 'reschedule-date' }, 'New Date'), React.createElement('input', { type: 'date', id: 'reschedule-date', value: date, onChange: (e) => setDate(e.target.value) })),
                React.createElement('div', { className: 'form-field' }, React.createElement('label', { htmlFor: 'reschedule-time' }, 'New Time'), React.createElement('input', { type: 'time', id: 'reschedule-time', value: time, onChange: (e) => setTime(e.target.value) }))
            ),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', marginTop: '10px' } }, 'Confirm New Time')
        )
    );
}
// Stitching Form Component
function StitchingForm({ onSubmit, onUpdate }) {
    const [garmentType, setGarmentType] = useState('');
    const [fabricType, setFabricType] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [dueDate, setDueDate] = useState('');
    const [deliveryType, setDeliveryType] = useState('pickup');
    
    useEffect(() => {
        const price = GARMENT_PRICES[garmentType] || 0;
        const deliveryFee = deliveryType === 'home' ? DELIVERY_FEE : 0;
        onUpdate({ price: price * quantity, deliveryFee, garmentType: garmentType });
    }, [garmentType, quantity, deliveryType]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!garmentType || !fabricType || !dueDate) {
            alert('Please fill all required fields');
            return;
        }
        onSubmit({ garmentType, fabricType, quantity, dueDate, deliveryType });
    };
    
    return React.createElement('form', { onSubmit: handleSubmit, className: 'stitching-form' },
        React.createElement('div', { className: 'form-row' },
            React.createElement('div', { className: 'form-field' },
                React.createElement('label', { htmlFor: 'garmentType' }, 'Garment Type'),
                React.createElement('select', { id: 'garmentType', value: garmentType, onChange: (e) => setGarmentType(e.target.value), required: true },
                    React.createElement('option', { value: '' }, 'Select Garment Type'),
                    Object.entries(GARMENT_PRICES).map(([name, price]) => 
                        React.createElement('option', { key: name, value: name }, `${name} - ₹${price.toFixed(2)}`)
                    )
                )
            ),
            React.createElement('div', { className: 'form-field' },
                React.createElement('label', { htmlFor: 'fabricType' }, 'Fabric Type'),
                React.createElement('select', { id: 'fabricType', value: fabricType, onChange: (e) => setFabricType(e.target.value), required: true },
                    React.createElement('option', { value: '' }, 'Select Fabric Type'),
                    ['Cotton', 'Linen', 'Wool', 'Silk', 'Polyester', 'Denim', 'Other'].map(f => React.createElement('option', {key: f, value: f}, f))
                )
            )
        ),
        React.createElement('div', { className: 'form-row' },
            React.createElement('div', { className: 'form-field' },
                React.createElement('label', { htmlFor: 'quantity' }, 'Quantity'),
                React.createElement('input', { type: 'number', id: 'quantity', min: '1', value: quantity, onChange: (e) => setQuantity(parseInt(e.target.value)), required: true })
            ),
            React.createElement('div', { className: 'form-field' },
                React.createElement('label', { htmlFor: 'dueDate' }, 'Desired Due Date'),
                React.createElement('input', { type: 'date', id: 'dueDate', value: dueDate, onChange: (e) => setDueDate(e.target.value), required: true })
            )
        ),
        React.createElement('div', { className: 'form-field' },
            React.createElement('label', { htmlFor: 'deliveryType' }, 'Delivery Option'),
            React.createElement('select', { id: 'deliveryType', value: deliveryType, onChange: (e) => setDeliveryType(e.target.value) },
                React.createElement('option', { value: 'pickup' }, 'In-Store Pickup'),
                React.createElement('option', { value: 'home' }, `Home Delivery (+₹${DELIVERY_FEE})`)
            )
        ),
        React.createElement('button', { type: 'submit', className: 'form-submit-btn' }, 'Submit Order Request')
    );
}
// Special Offer Component
function SpecialOffer({ onShowOffer }) {
    return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('div', { className: 'offer-badge' }, '20%'),
        React.createElement('p', null, React.createElement('strong', null, 'Festival Special')),
        React.createElement('p', null, 'Get 20% off on traditional wear!'),
        React.createElement('button', { className: 'btn btn-primary btn-sm', style: { marginTop: '10px' }, onClick: onShowOffer }, 'Get Coupon Code')
    );
}
// Payment Card Component
function PaymentCard({ orderDetails, orders, onPay }) {
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const pendingOrder = useMemo(() => orders.find(o => o.paymentStatus === 'pending'), [orders]);
    
    const subtotal = pendingOrder ? (pendingOrder.price - (pendingOrder.deliveryType === 'home' ? DELIVERY_FEE : 0)) : orderDetails.price;
    const deliveryFee = pendingOrder ? (pendingOrder.deliveryType === 'home' ? DELIVERY_FEE : 0) : orderDetails.deliveryFee;
    const handleApplyCoupon = () => {
        if (coupon === COUPON_CODE) {
            setDiscount(subtotal * 0.20);
        } else {
            alert("Invalid coupon code.");
            setDiscount(0);
        }
    };
    
    const total = subtotal + deliveryFee - discount;
    const targetOrder = pendingOrder || orderDetails;
    return React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card-title' }, 'Payment Details'),
        targetOrder.garmentType || pendingOrder ? 
        React.createElement(React.Fragment, null,
            React.createElement('p', {style: {fontWeight: 'bold'}}, pendingOrder ? `Pending for Order #${pendingOrder.id}` : `New Order: ${orderDetails.garmentType}`),
            React.createElement('div', {className: 'detail-row'}, React.createElement('span', null, 'Subtotal'), React.createElement('span', null, `₹${subtotal.toFixed(2)}`)),
            React.createElement('div', {className: 'detail-row'}, React.createElement('span', null, 'Delivery Fee'), React.createElement('span', null, `₹${deliveryFee.toFixed(2)}`)),
            React.createElement('div', {className: 'detail-row'}, React.createElement('span', null, 'Discount'), React.createElement('span', {style:{color: 'var(--success)'}}, `- ₹${discount.toFixed(2)}`)),
            React.createElement('div', {className: 'detail-row', style:{fontWeight:'bold', fontSize: '1.2rem'}}, React.createElement('span', null, 'Total'), React.createElement('span', null, `₹${total.toFixed(2)}`)),
            React.createElement('div', {className: 'form-row', style: {marginTop: '20px'}},
                React.createElement('input', { type: 'text', placeholder: 'Coupon Code', value: coupon, onChange: e => setCoupon(e.target.value)}),
                React.createElement('button', { className: 'btn btn-sm', onClick: handleApplyCoupon}, 'Apply')
            ),
            React.createElement('button', {className: 'btn btn-success', style: {width: '100%'}, disabled: !pendingOrder, onClick: () => onPay(pendingOrder.id) }, 'Pay Now')
        ) : React.createElement('p', null, "Select items in the 'New Order' form or view pending payments here.")
    );
}
// A simplified table component for displaying order history.
function OrderHistoryTable({orderHistory, onLeaveReview}) {
    return React.createElement('table', { className: 'customer-table' },
        React.createElement('thead', null,
            React.createElement('tr', null,
                React.createElement('th', null, 'Order ID'),
                React.createElement('th', null, 'Date'),
                React.createElement('th', null, 'Items'),
                React.createElement('th', null, 'Amount'),
                React.createElement('th', null, 'Rating'),
                React.createElement('th', null, 'Actions')
            )
        ),
        React.createElement('tbody', null,
            orderHistory.map(order => 
                React.createElement('tr', { key: order.id },
                    React.createElement('td', null, `#ST-${order.id}`),
                    React.createElement('td', null, new Date(order.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
                    React.createElement('td', null, order.garmentType),
                    React.createElement('td', null, `₹${order.price.toFixed(2)}`),
                    React.createElement('td', null,
                        React.createElement('div', { className: 'rating-stars' },
                            order.rating ? ('★'.repeat(order.rating) + '☆'.repeat(5 - order.rating)) : 'Not Rated'
                        )
                    ),
                    React.createElement('td', null,
                        order.rating === null && React.createElement('button', {
                            className: 'btn btn-warning btn-sm',
                            onClick: () => onLeaveReview(order)
                        }, 'Leave a Review')
                    )
                )
            )
        )
    );
}
// Review Modal
function ReviewModal({ order, onSubmit, onClose }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        onSubmit(order.id, rating, reviewText);
    };
    return React.createElement(Modal, { title: `Review for Order #${order.id}`, onClose: onClose },
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'form-field' },
                React.createElement('label', null, 'Your Rating'),
                React.createElement('div', { className: 'rating-stars', style: { fontSize: '2rem' } },
                    [1, 2, 3, 4, 5].map(star => 
                        React.createElement('span', {
                            key: star,
                            style: { color: (hoverRating || rating) >= star ? '#FFD700' : '#E9ECEF' },
                            onMouseEnter: () => setHoverRating(star),
                            onMouseLeave: () => setHoverRating(0),
                            onClick: () => setRating(star)
                        }, '★')
                    )
                )
            ),
            React.createElement('div', { className: 'form-field' },
                React.createElement('label', { htmlFor: 'reviewText' }, 'Your Comments'),
                React.createElement('textarea', {
                    id: 'reviewText',
                    placeholder: 'Tell us about your experience...',
                    value: reviewText,
                    onChange: (e) => setReviewText(e.target.value)
                })
            ),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%'} }, 'Submit Review')
        )
    );
}
// Recent Reviews Card Component
function RecentReviewsCard({ orders }) {
    const reviews = [...orders]
        .filter(o => o.rating !== null && o.reviewText && o.reviewText.length > 0)
        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
        .slice(0, 5);
    if (reviews.length === 0) {
        return React.createElement('p', null, 'No customer reviews yet.');
    }
    return React.createElement('ul', { className: 'task-list' },
        reviews.map(review => 
            React.createElement('li', { key: review.id },
                React.createElement('div', null,
                    React.createElement('div', { className: 'rating-stars' }, '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)),
                    React.createElement('p', null, review.reviewText),
                    React.createElement('p', { style: { fontSize: '0.8rem', color: 'var(--secondary)'}}, `- ${review.customer} for Order #${review.id}`)
                )
            )
        )
    );
}
// Tailor Dashboard Component
function TailorDashboard({ onLogout, allOrders, setAllOrders, appointments, setCustomerNotification }) {
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: '', isError: false });
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [contactingCustomer, setContactingCustomer] = useState(null);
    const [viewingCustomer, setViewingCustomer] = useState(null);
    
    const showNotificationMessage = (message, isError = false) => {
        setNotification({ message, isError });
        setShowNotification(true);
    };
    
    const handleContactCustomer = (customer) => setContactingCustomer(customer);
    const handleViewCustomer = (customer) => setViewingCustomer(customer);
    const handleMarkAsPaid = (orderId) => {
        setAllOrders(allOrders.map(o => o.id === orderId ? {...o, paymentStatus: 'paid'} : o));
        showNotificationMessage(`Order #${orderId} marked as paid.`);
    };
    const handleDiscardOrder = (orderId) => {
        const orderToDiscard = allOrders.find(o => o.id === orderId);
        if (orderToDiscard) {
            localStorage.setItem('discardedOrderAlert', JSON.stringify(orderToDiscard));
            setAllOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            showNotificationMessage(`Order #${orderId} for ${orderToDiscard.customer} has been discarded.`);
            setUpdatingOrder(null);
        }
    };
    const handleStatusUpdate = (orderId, newStatus, newProgress) => {
        const orderToUpdate = allOrders.find(o => o.id === orderId);
        if ((newStatus === 'delivery' || newStatus === 'delivered') && orderToUpdate.paymentStatus === 'pending') {
            showNotificationMessage(`Payment not made. Cannot mark as '${newStatus}'.`, true);
            if (newStatus === 'delivery') {
                setCustomerNotification({ message: `Please complete payment for Order #${orderId} to schedule delivery.`, isError: true });
            }
            setUpdatingOrder(null);
            return; 
        }
        setAllOrders(allOrders.map(o => o.id === orderId ? {...o, status: newStatus, progress: newProgress } : o));
        setUpdatingOrder(null);
        showNotificationMessage(`Order #${orderId} status updated to ${newStatus}.`);
    };
    
    return React.createElement('div', { className: 'page active' },
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'dashboard-header' },
                React.createElement('div', { className: 'dashboard-logo' }, React.createElement('i', { className: 'fas fa-shirt' }), React.createElement('span', null, 'SmartTailor Business')),
                React.createElement('div', { className: 'nav-buttons' }, React.createElement('span', { style: { marginRight: '10px' } }, 'Welcome, Master Stitch!'), React.createElement('button', { className: 'btn btn-danger', onClick: onLogout }, 'Logout'))
            ),
            React.createElement('div', { className: 'stats-container' },
                React.createElement('div', { className: 'stat-card' }, React.createElement('div', { className: 'stat-label' }, 'Total Open Orders'), React.createElement('div', { className: 'stat-value' }, allOrders.length), React.createElement('div', { className: 'stat-change positive' }, '+3 from last week')),
                React.createElement('div', { className: 'stat-card' }, React.createElement('div', { className: 'stat-label' }, 'Orders Due Today'), React.createElement('div', { className: 'stat-value' }, '3'), React.createElement('div', { className: 'stat-change negative' }, 'Urgent attention needed')),
                React.createElement('div', { className: 'stat-card' }, React.createElement('div', { className: 'stat-label' }, 'Avg. Completion Time'), React.createElement('div', { className: 'stat-value' }, '5.2 days'), React.createElement('div', { className: 'stat-change positive' }, '-0.8 from last month')),
                React.createElement('div', { className: 'stat-card' }, React.createElement('div', { className: 'stat-label' }, 'Customer Satisfaction'), React.createElement('div', { className: 'stat-value' }, '4.8/5'), React.createElement('div', { className: 'stat-change' }, 'Based on 42 reviews'))
            ),
            
            React.createElement('div', { className: 'dashboard-grid' },
                React.createElement('div', null,
                    React.createElement('div', { className: 'card' },
                        React.createElement('div', { className: 'card-title' }, React.createElement('span', null, 'Recent Orders')),
                        [...allOrders]
                            .sort((a, b) => b.id - a.id)
                            .slice(0, 3)
                            .map(order => React.createElement(TailorOrderCard, { key: order.id, order: order, onUpdateStatus: setUpdatingOrder, onContactCustomer: setContactingCustomer }))
                    ),
                    React.createElement('div', { className: 'card' }, React.createElement('div', { className: 'card-title' }, 'Payment Status'), React.createElement(PaymentStatusCard, { orders: allOrders, onMarkAsPaid: handleMarkAsPaid }))
                ),
                React.createElement('div', null,
                    React.createElement('div', { className: 'card' }, React.createElement('div', { className: 'card-title' }, 'Due Date Calendar'), React.createElement(Calendar, { orders: allOrders })),
                    React.createElement('div', { className: 'card' }, 
                        React.createElement('div', { className: 'card-title' }, 'Financial Overview'), 
                        React.createElement(FinancialOverviewCard, null)
                    ),
                    React.createElement('div', { className: 'card' }, 
                        React.createElement('div', { className: 'card-title' }, 'Recent Reviews'), 
                        React.createElement(RecentReviewsCard, { orders: allOrders })
                    )
                )
            ),
            
            React.createElement('div', { className: 'card' }, React.createElement('div', { className: 'card-title' }, 'Customer Management'), React.createElement(CustomerTable, {allOrders: allOrders, onView: handleViewCustomer, onContact: handleContactCustomer}))
        ),
        
        showNotification && React.createElement(Notification, { message: notification.message, isError: notification.isError, onClose: () => setShowNotification(false) }),
        updatingOrder && React.createElement(StatusUpdateModal, {
            order: updatingOrder, 
            onUpdate: handleStatusUpdate, 
            onDiscard: handleDiscardOrder,
            onClose: () => setUpdatingOrder(null) 
        }),
        contactingCustomer && React.createElement(Modal, { title: `Contact ${contactingCustomer.name || contactingCustomer.customer}`, onClose: () => setContactingCustomer(null) },
                                React.createElement('div', { className: 'detail-row' }, React.createElement('span', null, React.createElement('strong', null, 'Phone:')), React.createElement('span', null, contactingCustomer.phone || '+91-9876543210')),
                                contactingCustomer.garmentType && React.createElement('div', {className: 'detail-row'}, React.createElement('span', null, React.createElement('strong', null, 'Regarding Order:')), React.createElement('span', null, `#ST-${contactingCustomer.id} (${contactingCustomer.garmentType})`))
        ),
        viewingCustomer && React.createElement(Modal, { title: `Order History for ${viewingCustomer.name}`, onClose: () => setViewingCustomer(null)}, 
            React.createElement('div', { style: { overflowX: 'auto' } },
                React.createElement(OrderHistoryTable, { 
                    orderHistory: allOrders.filter(o => o.customer === viewingCustomer.name),
                    onLeaveReview: () => {}
                })
            )
        )
    );
}
// Tailor Order Card Component
function TailorOrderCard({ order, onUpdateStatus, onContactCustomer }) {
    const statusMap = { 'new': { text: 'New Order', class: 'status-new' }, 'progress': { text: 'In Progress', class: 'status-progress' }, 'ready': { text: 'Trial Ready', class: 'status-ready' }, 'completed': { text: 'Completed', class: 'status-completed' }, 'delivery': { text: 'Awaiting Home Delivery', class: 'status-delivery' }, 'delivered': { text: 'Delivered', class: 'status-completed' }};
    const statusInfo = statusMap[order.status] || { text: 'Unknown', class: '' };
    
    return React.createElement('div', { className: 'order-card card' },
        React.createElement('div', { className: 'order-header' }, React.createElement('div', { className: 'order-id' }, `Order #ST-${order.id} - ${order.customer || 'Sarah Chen'}`), React.createElement('div', { className: `order-status ${statusInfo.class}` }, statusInfo.text)),
        React.createElement('div', { className: 'order-details' },
            React.createElement('p', null, React.createElement('strong', null, 'Item:'), ` ${order.garmentType} - ${order.fabricType}`),
            React.createElement('p', null, React.createElement('strong', null, 'Measurements:'), ` ${order.measurements || 'On File'}`),
            React.createElement('p', null, React.createElement('strong', null, 'Delivery Due:'), ` ${formatDate(order.dueDate)}`)
        ),
        React.createElement('div', { className: 'action-buttons' },
            React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => onUpdateStatus(order) }, 'Update Status'),
            React.createElement('button', { className: 'btn btn-sm', style: { background: '#E9ECEF' }, onClick: () => onContactCustomer(order)}, 'Contact Customer')
        )
    );
}
// Status Update Modal
function StatusUpdateModal({ order, onUpdate, onDiscard, onClose }) {
    const statusFlow = { 'new': { next: 'progress', progress: 25, label: 'Start Progress' }, 'progress': { next: 'ready', progress: 75, label: 'Mark as Ready for Trial' }, 'ready': { next: 'completed', progress: 100, label: 'Mark as Completed' }, 'completed': { next: 'delivery', progress: 100, label: 'Ready for Home Delivery'}, 'delivery': { next: 'delivered', progress: 100, label: 'Mark as Delivered' }, 'delivered': null };
    const nextStep = statusFlow[order.status];
    return React.createElement(Modal, { title: `Update Order #${order.id}`, onClose: onClose },
        React.createElement('p', null, `Current Status: `, React.createElement('strong', null, order.status.replace(/^\w/, c => c.toUpperCase()))),
        React.createElement('div', null,
            nextStep && React.createElement('button', {
                className: 'btn btn-success',
                style: { width: '100%', marginTop: '20px' },
                onClick: () => onUpdate(order.id, nextStep.next, nextStep.progress)
            }, nextStep.label),
            order.status === 'new' && React.createElement('button', {
                className: 'btn btn-danger',
                style: { width: '100%', marginTop: '10px' },
                onClick: () => onDiscard(order.id)
            }, 'Discard Order'),
            
            !nextStep && React.createElement('p', { style: { marginTop: '20px' } }, 'This order is in its final stage.')
        )
    );
}
// Payment Status Card Component
function PaymentStatusCard({ orders, onMarkAsPaid }) {
    return React.createElement('ul', { className: 'task-list' },
        orders.filter(o => o.status !== 'new').map(order => 
            React.createElement('li', { key: order.id },
                React.createElement('div', null,
                    React.createElement('p', { style: { fontWeight: 'bold' } }, `#ST-${order.id} - ${order.customer}`),
                    React.createElement('p', null, `${order.garmentType} - ₹${order.price.toFixed(2)}`)
                ),
                React.createElement('div', null,
                    order.paymentStatus === 'paid' ? React.createElement('span', { className: 'payment-status-badge payment-status-paid' }, 'Paid') :
                    React.createElement('button', { className: 'btn btn-warning btn-sm', onClick: () => onMarkAsPaid(order.id) }, 'Mark as Paid')
                )
            )
        )
    );
}
// Calendar Component
function Calendar({ orders }) {
    const [currentDate, setCurrentDate] = useState(new Date('2025-09-01'));
    const ordersByDueDate = useMemo(() => {
        return orders.reduce((acc, order) => {
            const dateKey = new Date(order.dueDate).toISOString().split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(order);
            return acc;
        }, {});
    }, [orders]);
    const changeMonth = (amount) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const calendarCells = [];
    dayHeaders.forEach(day => calendarCells.push(React.createElement('div', { key: `header-${day}`, className: 'calendar-day header' }, day)));
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarCells.push(React.createElement('div', { key: `empty-${i}`, className: 'calendar-day empty' }));
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const today = new Date();
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dateKey = new Date(year, month, day + 1).toISOString().split('T')[0];
        const ordersOnDay = ordersByDueDate[dateKey] || [];
        
        let className = 'calendar-day';
        let tooltip = '';
        if (isToday) className += ' today';
        
        if (ordersOnDay.length > 0) {
            tooltip = `${ordersOnDay.length} order(s) due:\n` + ordersOnDay.map(o => `#ST-${o.id} - ${o.customer} (${o.garmentType})`).join('\n');
            
            const areAllDelivered = ordersOnDay.every(o => o.status === 'delivered');
            if (areAllDelivered) {
                className += ' event-delivered';
            } else {
                className += ' event-delivery';
            }
        }
        
        calendarCells.push(React.createElement('div', { key: day, className: className, title: tooltip }, day));
    }
    return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'calendar-header' },
            React.createElement('button', { className: 'btn btn-sm', onClick: () => changeMonth(-1) }, '‹ Prev'),
            React.createElement('strong', null, `${monthName} ${year}`),
            React.createElement('button', { className: 'btn btn-sm', onClick: () => changeMonth(1) }, 'Next ›')
        ),
        React.createElement('div', { className: 'calendar' }, calendarCells)
    );
}
// Financial Overview Component
function FinancialOverviewCard() {
    const chartData = [
        { day: 'Mon', value: 80 }, { day: 'Tue', value: 95 },
        { day: 'Wed', value: 75 }, { day: 'Thu', value: 100 },
        { day: 'Fri', value: 85 }, { day: 'Sat', value: 50 },
        { day: 'Sun', value: 35 }
    ];
    return React.createElement('div', { className: 'financial-overview' },
        React.createElement('div', { className: 'chart-container' },
            chartData.map(item => 
                React.createElement('div', { key: item.day, className: 'bar-wrapper' },
                    React.createElement('div', { className: 'bar', style: { height: `${item.value}%` } }),
                    React.createElement('span', null, item.day)
                )
            )
        ),
        React.createElement('div', { className: 'summary' },
            React.createElement('div', { className: 'summary-row' },
                React.createElement('span', null, 'Total Revenue (Month)'),
                React.createElement('span', null, '₹2,88,150')
            ),
            React.createElement('div', { className: 'summary-row' },
                React.createElement('span', null, 'Material Costs'),
                React.createElement('span', null, '₹84,375')
            ),
            React.createElement('div', { className: 'summary-row' },
                React.createElement('span', null, 'Other Expenses'),
                React.createElement('span', null, '₹11,250')
            ),
            React.createElement('div', { className: 'summary-row net-profit' },
                React.createElement('span', null, 'Net Profit'),
                React.createElement('span', null, '₹1,92,525')
            )
        )
    );
}
// Customer Table Component
function CustomerTable({ allOrders, onView, onContact }) {
    const customersData = useMemo(() => {
        if (!allOrders) return [];
        
        const customerMap = allOrders.reduce((acc, order) => {
            if (!acc[order.customer]) {
                acc[order.customer] = {
                    name: order.customer,
                    phone: order.customerPhone,
                    orders: []
                };
            }
            acc[order.customer].orders.push(order);
            return acc;
        }, {});
        return Object.values(customerMap).map(customer => {
            const sortedOrders = customer.orders.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
            const totalSpent = customer.orders.reduce((sum, order) => sum + order.price, 0);
            return {
                id: customer.name,
                name: customer.name,
                phone: customer.phone,
                lastOrder: formatDate(sortedOrders[0].dueDate),
                totalOrders: customer.orders.length,
                totalSpent: `₹${totalSpent.toLocaleString('en-IN')}`
            };
        });
    }, [allOrders]);
    
    return React.createElement('table', { className: 'customer-table' },
        React.createElement('thead', null,
            React.createElement('tr', null,
                React.createElement('th', null, 'Name'),
                React.createElement('th', null, 'Last Order'),
                React.createElement('th', null, 'Total Orders'),
                React.createElement('th', null, 'Total Spent'),
                React.createElement('th', null, 'Actions')
            )
        ),
        React.createElement('tbody', null,
            customersData.map(customer => 
                React.createElement('tr', { key: customer.id },
                    React.createElement('td', null, customer.name),
                    React.createElement('td', null, customer.lastOrder),
                    React.createElement('td', null, customer.totalOrders),
                    React.createElement('td', null, customer.totalSpent),
                    React.createElement('td', null, 
                        React.createElement('div', { className: 'actions-cell' },
                            React.createElement('button', { className: 'btn btn-sm', style: { background: '#E9ECEF' }, onClick: () => onView(customer)}, 'View'),
                            React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => onContact(customer)}, 'Contact')
                        )
                    )
                )
            )
        )
    );
}
// NEW: Chatbot Component
function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your SmartTailor assistant. How can I help you today? 🧵", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const chatbotResponses = {
        status: "You can check the status of your active orders right here on the dashboard! Look for the 'My Active Orders' section. Each order has a timeline showing its progress from 'Confirmed' to 'Ready'.",
        price: "Our pricing depends on the garment. For example, a shirt starts at ₹1500 and a suit at ₹12000. You can see a full price list when you click the 'New Order' button and select a garment type.",
        contact: "You can contact your tailor, Master Stitch, by clicking the 'Contact Tailor' button on any of your active orders. His phone number is +91-9876543210.",
        delivery: "We offer both in-store pickup and home delivery. You can select your preferred option when placing a new order. Home delivery has an additional fee of ₹150. If your order is complete, you can request delivery from the order card.",
        appointment: "You can see your upcoming appointments in the 'Upcoming Appointments' card. You can also reschedule them or add them to your calendar from there.",
        measurements: "Your saved measurements are displayed in the 'My Measurements' card. You can update them at any time by clicking the 'Update Measurements' button.",
        default: "I can help with questions about order status, pricing, delivery, appointments, or measurements. How can I assist you today? Tailoring excellence, just a question away! 🧵"
    };
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);
    const getBotAnswer = (input) => {
        input = input.toLowerCase();
        if (input.includes('status') || input.includes('track')) return chatbotResponses.status;
        if (input.includes('price') || input.includes('cost') || input.includes('how much')) return chatbotResponses.price;
        if (input.includes('contact') || input.includes('call') || input.includes('number')) return chatbotResponses.contact;
        if (input.includes('delivery') || input.includes('ship')) return chatbotResponses.delivery;
        if (input.includes('appointment') || input.includes('meeting')) return chatbotResponses.appointment;
        if (input.includes('measurement') || input.includes('size')) return chatbotResponses.measurements;
        if (input.includes('hi') || input.includes('hello')) return "Hi there! 👋 How can I help you with your tailoring needs today?";
        return chatbotResponses.default;
    };
    const handleSendMessage = () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;
        const newUserMessage = { text: trimmedInput, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setTimeout(() => {
            const botResponse = getBotAnswer(trimmedInput);
            const newBotMessage = { text: botResponse, sender: 'bot' };
            setMessages(prev => [...prev, newBotMessage]);
        }, 1000);
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    
    return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'chatbot-toggle', onClick: () => setIsOpen(!isOpen) }, 
            React.createElement('i', { className: 'fab fa-whatsapp' })
        ),
        React.createElement('div', { className: `chatbot-container ${isOpen ? '' : 'hidden'}` },
            React.createElement('div', { className: 'chatbot-header' },
                React.createElement('span', null, 'SmartTailor Assistant'),
                React.createElement('button', { className: 'chatbot-close', onClick: () => setIsOpen(false) }, '×')
            ),
            React.createElement('div', { className: 'chatbot-messages' },
                messages.map((msg, index) => 
                    React.createElement('div', { key: index, className: `chatbot-message ${msg.sender}` }, msg.text)
                ),
                React.createElement('div', { ref: messagesEndRef })
            ),
            React.createElement('div', { className: 'chatbot-input-area' },
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Ask a question...',
                    value: inputValue,
                    onChange: (e) => setInputValue(e.target.value),
                    onKeyPress: handleKeyPress
                }),
                React.createElement('button', { onClick: handleSendMessage }, React.createElement('i', { className: 'fas fa-paper-plane' }))
            )
        )
    );
}
// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-US', options);
}
// Main App Component
function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [userRole, setUserRole] = useState(null);
    const [customerNotification, setCustomerNotification] = useState(null);
    const initialOrdersData = [
        { id: 7842, customer: 'Sarah Chen', customerPhone: '+91-9876543210', garmentType: 'Formal Blazer', fabricType: 'Navy Blue Italian Wool', dueDate: '2025-08-12', status: 'delivered', progress: 100, deliveryType: 'pickup', price: 15000, paymentStatus: 'paid', rating: 5, reviewText: "Excellent work on the blazer, perfect fit!"},
        { id: 7843, customer: 'Michael Roy', customerPhone: '+91-9876543211', garmentType: '2 Custom Shirts', fabricType: 'Cotton Linen Blend', dueDate: '2025-09-15', status: 'progress', progress: 50, deliveryType: 'pickup', price: 7500, paymentStatus: 'pending', rating: null, reviewText: '' },
        { id: 7844, customer: 'Sarah Chen', customerPhone: '+91-9876543210', garmentType: 'Suit', fabricType: 'Wool', dueDate: '2025-09-20', status: 'completed', progress: 100, deliveryType: 'home', price: 12150, paymentStatus: 'paid', rating: null, reviewText: '' },
        { id: 7845, customer: 'David Kim', customerPhone: '+91-9876543212', garmentType: 'Pants', fabricType: 'Denim', dueDate: '2025-09-22', status: 'delivery', progress: 100, deliveryType: 'home', price: 2150, paymentStatus: 'paid', rating: null, reviewText: '' },
        { id: 7846, customer: 'Sarah Chen', customerPhone: '+91-9876543210', garmentType: 'Dress', fabricType: 'Silk', dueDate: '2025-09-25', status: 'delivered', progress: 100, deliveryType: 'home', price: 4150, paymentStatus: 'paid', rating: 4, reviewText: 'Very beautiful dress, thank you!'}
    ];
    const initialAppointmentsData = [
        { id: 1, type: 'Fitting Appointment', customer: 'Sarah Chen', date: '2025-09-10T15:00:00.000Z', location: 'Master Stitch Tailoring Shop', gradient: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)' },
        { id: 2, type: 'Final Delivery', customer: 'Sarah Chen', date: '2025-09-22T11:00:00.000Z', location: 'Master Stitch Tailoring Shop', gradient: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' }
    ];
    const [allOrders, setAllOrders] = useState(() => {
        try {
            const savedOrders = localStorage.getItem('allOrders');
            return savedOrders ? JSON.parse(savedOrders) : initialOrdersData;
        } catch (error) {
            console.error("Error parsing orders from localStorage", error);
            return initialOrdersData;
        }
    });
    const [appointments, setAppointments] = useState(() => {
        try {
            const savedAppointments = localStorage.getItem('appointments');
            return savedAppointments ? JSON.parse(savedAppointments) : initialAppointmentsData;
        } catch (error) {
            console.error("Error parsing appointments from localStorage", error);
            return initialAppointmentsData;
        }
    });
    useEffect(() => {
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
    }, [allOrders]);
    useEffect(() => {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }, [appointments]);
    
    const handleLogin = (role) => {
        setUserRole(role);
        setCurrentPage(role);
    };
    
    const handleLogout = () => {
        setUserRole(null);
        setCurrentPage('login');
    };
    
    return React.createElement(React.Fragment, null,
        currentPage === 'login' && React.createElement(LoginPage, { onLogin: handleLogin }),
        currentPage === 'customer' && React.createElement(CustomerDashboard, { 
            onLogout: handleLogout,
            allOrders: allOrders,
            setAllOrders: setAllOrders,
            appointments: appointments,
            setAppointments: setAppointments,
            customerNotification: customerNotification,
            setCustomerNotification: setCustomerNotification
        }),
        currentPage === 'tailor' && React.createElement(TailorDashboard, { 
            onLogout: handleLogout,
            allOrders: allOrders,
            setAllOrders: setAllOrders,
            appointments: appointments,
            setCustomerNotification: setCustomerNotification
        })
    );
}
// Render the app
ReactDOM.render(React.createElement(App, null), document.getElementById('root'));