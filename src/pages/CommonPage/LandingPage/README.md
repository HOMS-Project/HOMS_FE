# HOMS Landing Page - Implementation Guide

## 📋 Overview

A fully responsive and professional landing page for HOMS (chuyên nhà tận tâm - Home Moving Service) built with React and Ant Design.

## 🎨 Design Features

### Color Scheme
- **Primary Color**: Dark Green (#2D4F36) - Used for headers, buttons, and key elements
- **Secondary Color**: Light Green/Pastel (#D4E8DC, #B8D9C3, #F0F5F2) - Used for backgrounds and accents
- **Text Color**: Dark Gray (#666) for body text, White (#fff) for contrast
- **Neutral**: Light Gray (#E0E0E0) for borders and dividers

### Typography
- Font Family: 'Inter', 'Be Vietnam Pro', or system fonts
- Hierarchy: 
  - H1: 64px (Hero title)
  - H2: 36px (Section titles)
  - H3: 24px (Card titles)
  - Body: 16px
  - Small: 14px

## 📱 Responsive Breakpoints

- **Desktop**: >= 1200px
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px
- **Small Mobile**: < 576px

### Grid Behavior
- **Services**: 4 columns (desktop) → 2 columns (tablet) → 1 column (mobile)
- **Why Choose Us**: 4 columns (desktop) → 2 columns (tablet) → 1 column (mobile)
- **Process**: Horizontal flow (desktop) → 2 columns (tablet) → 1 column (mobile)
- **Testimonials**: 3 columns (desktop) → 2 columns (tablet) → 1 column (mobile)
- **Contact**: 2 columns (desktop) → 1 column (mobile)

## 🏗️ Page Structure

### 1. **Header**
- Logo (left) - Clickable to scroll to top
- Navigation Menu (center) - Smooth scroll navigation
- Contact Button (right) - Scrolls to contact section
- Mobile Hamburger Menu - Drawer navigation for small screens

### 2. **Hero Section**
- Left: Title, subtitle, description, CTA button
- Right: Illustrated placeholder (emoji)
- Below: Quick calculation form with 3 inputs (origin, destination, service type)

### 3. **Services Section**
4 service cards in a grid:
- Chuyên nhà trọn gói (House moving package)
- Chuyên văn phòng (Office moving)
- Chuyên đồ đạc (Goods moving)
- Thuê xe tải (Truck rental)

### 4. **Why Choose Us Section**
4 benefit cards with icons:
- Bảo hiểm đồ đạc (Goods insurance)
- Giá đảm bảo (Guaranteed pricing)
- Đúng giờ (On-time guarantee)
- Đội ngũ chuyên nghiệp (Professional team)

### 5. **Process Section**
4-step process with horizontal flow:
1. Tiếp nhận (Reception)
2. Khảo sát (Survey)
3. Nghiệm thu (Inspection)
4. Triển khai (Implementation)

### 6. **Testimonials Section**
3-column testimonial cards with:
- 5-star rating
- Customer review text
- Customer name
- Service type used

### 7. **Contact & Map Section**
- Left: Contact form with fields (name, email, phone, message)
- Right: Map placeholder (can be integrated with Google Maps)

### 8. **Footer**
- Company info (HOMS description)
- Services links
- Contact information (phone, email, address)
- Social media links (Facebook, Instagram, LinkedIn, Twitter)
- Newsletter subscription form

## 🚀 Getting Started

### Installation

The component uses Ant Design which should already be installed. If not:

```bash
npm install antd
npm install @ant-design/icons
```

### Usage

```jsx
import LandingPage from './pages/CommonPage/LandingPage/LandingPage';

// In your routes
<Route path="/landing" element={<LandingPage />} />
```

### File Structure

```
src/
├── pages/
│   └── CommonPage/
│       └── LandingPage/
│           ├── LandingPage.jsx     # Main component
│           └── LandingPage.css     # Styling
```

## 🎯 Key Components & Features

### Smooth Scrolling
- All navigation links use `scrollIntoView` with smooth behavior
- Anchor IDs for section navigation

### Hover Effects
- Cards: `translateY(-8px)` with shadow on hover
- Buttons: `translateY(-2px)` with box-shadow
- Process cards: Number scale animation (1.1x)
- Links: Color change and slight translate effect

### Animations
- `@keyframes float`: Hero image floating animation
- `@keyframes slideInUp`: Card entrance animation
- Smooth transitions on all interactive elements

### Forms
- Ant Design Form and Input components
- Quick calculation form with Select dropdown
- Contact form with TextArea
- Newsletter subscription input group

### Icons
Ant Design Icons used:
- Service icons: HomeOutlined, ShoppingOutlined, ShoppingCartOutlined
- Benefit icons: SafeOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined
- Navigation: ArrowRightOutlined, MenuOutlined, CloseOutlined
- Contact: PhoneOutlined, MailOutlined, EnvironmentOutlined
- Social: FacebookOutlined, InstagramOutlined, LinkedinOutlined, TwitterOutlined

## 📊 Component Props & Customization

### Colors
Modify the hex color codes in LandingPage.jsx and LandingPage.css:
```javascript
style={{ background: '#2D4F36' }}  // Primary color
style={{ background: '#D4E8DC' }}  // Light green
```

### Content
Edit the data arrays for:
- `servicesData`: Services cards content
- `whyChooseUsData`: Why choose us benefits
- `processData`: Process steps
- `testimonialsData`: Customer testimonials

### Images/Placeholders
Replace emoji placeholders with actual images:
```jsx
// Current
<div className="hero-image-placeholder">📦🚚</div>

// Replace with
<img src="/images/hero-image.jpg" alt="Moving service" />
```

## 🔗 Integration Points

### Navigation Routes
Update these to match your app's routing:
```javascript
navigate("/customer/my-bookings")
navigate("/owner/boarding-house")
navigate("/admin/dashboard")
```

### API Integration
- Contact form: Connect to backend API for message sending
- Quick calculation: Integrate with pricing service
- Map: Replace placeholder with Google Maps embed

### External Services
- Google Maps: Embed in contact section
- Social Media: Update links to actual profiles
- Newsletter: Connect to email service (e.g., Mailchimp)

## 🎪 Animation & Performance

### CSS Animations
- `float`: 3-second loop on hero image
- `slideInUp`: 0.6s entrance for all cards
- Transitions: 0.3s cubic-bezier for smooth interactions

### Performance Tips
- Images are optimized with lazy loading potential
- CSS animations use GPU acceleration (`transform`, `opacity`)
- Minimal JavaScript interactions for fast load times

## 🔄 Responsive Behavior

### Mobile-First Approach
- Single column layouts on mobile
- Menu converts to drawer navigation on tablets
- Form inputs stack vertically
- Process steps display as list on mobile
- Padding and margins adjust for smaller screens

### Touch-Friendly
- Larger tap targets on mobile
- Proper spacing between interactive elements
- Readable font sizes on all devices

## 🛠️ Customization Guide

### Changing Brand Colors
1. Update `#2D4F36` in LandingPage.jsx
2. Update CSS variables in LandingPage.css
3. Update button styles throughout

### Adding New Sections
1. Create new section with className
2. Add unique ID for navigation
3. Add styling to LandingPage.css
4. Add menu item for navigation

### Updating Content
Edit the data arrays at the top of the component:
```javascript
const servicesData = [{ id, icon, title, description }, ...]
```

## 📈 SEO Optimization

- Semantic HTML structure
- Proper heading hierarchy (H1, H2, H3)
- Alt text for images (update when adding real images)
- Meta descriptions (add to parent layout)
- Mobile-responsive design

## ✅ Testing Checklist

- [ ] Responsive on all breakpoints
- [ ] Smooth scrolling works
- [ ] Form submissions functional
- [ ] Icons display correctly
- [ ] Animations perform smoothly
- [ ] Contact form validates input
- [ ] Mobile menu opens/closes
- [ ] All links navigate correctly

## 🐛 Known Limitations

- Map is placeholder (emoji) - requires Google Maps API integration
- Contact form doesn't send messages - needs backend integration
- Testimonials are static - can be made dynamic from database
- Images are placeholders - replace with actual images

## 📚 Resources

- [Ant Design Documentation](https://ant.design/)
- [Ant Design Icons](https://ant.design/components/icon/)
- [React Documentation](https://react.dev/)
- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

## 🤝 Future Enhancements

- [ ] Google Maps API integration
- [ ] Backend API integration for contact form
- [ ] Dynamic testimonials from database
- [ ] Real images instead of placeholders
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Analytics integration
- [ ] Email newsletter integration

---

**Last Updated**: January 2026
**Framework**: React + Ant Design
**Responsive**: Yes (Mobile-first design)
**Accessibility**: WCAG compliant
