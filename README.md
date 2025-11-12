# Student Meal Card Controlling System

A comprehensive digital meal card management system for educational institutions built with React.js and Supabase. This system streamlines student meal tracking, inventory management, and cafeteria operations with real-time data synchronization.

![Student Meal Card System](https://img.shields.io/badge/React-18.2.0-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green) ![Vite](https://img.shields.io/badge/Vite-Build%20Tool-purple)

## 🌟 Features

### 🎓 Student Management
- **Student Registration** - Complete student profile creation with automatic QR code generation
- **Student Profiles** - Detailed student information with academic and personal data
- **Bulk Operations** - Manage multiple students with search and filter capabilities
- **Access Control** - Grant or deny meal access to individual students

### 🍽️ Meal Management
- **QR Code Verification** - Scan student QR codes for meal verification
- **Real-time Tracking** - Live meal consumption tracking (breakfast, lunch, dinner)
- **Daily Status Reports** - View who ate and who didn't for each meal
- **Meal History** - Complete audit trail of all meal verifications

### 📦 Inventory Management
- **Stock Registration** - Register new food items with consumption predictions
- **Inventory Tracking** - Monitor current stock levels and expiry dates
- **Consumption Analytics** - Predict when supplies will run out based on usage patterns
- **Supplier Management** - Maintain supplier information and items supplied

### 📊 Dashboard & Analytics
- **Role-based Dashboards** - Different views for Cafeteria Managers and Student Deans
- **Real-time Statistics** - Live updates on meal participation and inventory levels
- **Reporting** - Generate daily and historical reports
- **Data Visualization** - Charts and graphs for better insights

### 🔒 Security & Access Control
- **Role-based Access** - Different permissions for different user types
- **QR Code Security** - Secure meal verification with unique student QR codes
- **Access Denial** - Temporarily or permanently deny meal access to students
- **Audit Logs** - Complete tracking of all system activities

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/meal-card-system.git
   cd meal-card-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Students table
   CREATE TABLE public.students (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id TEXT NOT NULL UNIQUE,
     first_name TEXT,
     middle_name TEXT,
     last_name TEXT,
     department TEXT,
     year DATE,
     photo_url TEXT,
     diet_type TEXT,
     qr_code TEXT,
     status TEXT DEFAULT 'active',
     registered_at TIMESTAMP DEFAULT NOW(),
     user_id UUID DEFAULT gen_random_uuid(),
     password TEXT,
     "Date-of-birth" DATE,
     "Place-of-Birth" TEXT,
     "Gender" TEXT,
     "phone-number" NUMERIC,
     email TEXT,
     nationality TEXT,
     "emergency-contact-name" TEXT,
     "emergency-contact-phone" TEXT,
     "emergency-contact-email" TEXT,
     "national-id-number" TEXT,
     "health-level" TEXT
   );

   -- Denied students table
   CREATE TABLE public.denied_students (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id TEXT NOT NULL REFERENCES public.students(student_id),
     denied_at TIMESTAMP DEFAULT NOW(),
     reason TEXT,
     denied_by UUID,
     is_active BOOLEAN DEFAULT TRUE
   );

   -- Meal records table
   CREATE TABLE public.meal_records (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id TEXT NOT NULL REFERENCES public.students(student_id),
     meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
     meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
     consumed_at TIMESTAMP DEFAULT NOW(),
     cafeteria_id UUID
   );

   -- Food inventory table
   CREATE TABLE public.food_inventory (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     food_item TEXT NOT NULL,
     quantity DECIMAL NOT NULL,
     unit TEXT DEFAULT 'kg',
     consumption_per_student DECIMAL NOT NULL,
     meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
     max_storage_days INTEGER NOT NULL,
     stored_at TIMESTAMP DEFAULT NOW(),
     expiry_date DATE,
     status TEXT DEFAULT 'active'
   );

   -- Stock transactions table
   CREATE TABLE public.stock_transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     food_item_id UUID REFERENCES public.food_inventory(id),
     transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out')),
     quantity DECIMAL NOT NULL,
     transaction_date TIMESTAMP DEFAULT NOW(),
     notes TEXT
   );

   -- Suppliers table
   CREATE TABLE public.suppliers (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     contact_person TEXT,
     phone TEXT,
     email TEXT,
     address TEXT,
     items_supplied TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Complaints table
   CREATE TABLE public.complaints (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id TEXT NOT NULL REFERENCES public.students(student_id),
     message TEXT NOT NULL,
     status TEXT DEFAULT 'pending',
     response TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     resolved_at TIMESTAMP
   );
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── sidebars/
│   │   │   ├── BaseSidebar.jsx
│   │   │   ├── CafeManagerSidebar.jsx
│   │   │   └── StudentDeanSidebar.jsx
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── cafeteria/
│   │   │   └── CafeStudentsView.jsx
│   │   ├── dashboards/
│   │   │   ├── CafeManagerDashboard.jsx
│   │   │   └── StudentDeanDashboard.jsx
│   │   ├── store/
│   │   │   ├── StockRegister.jsx
│   │   │   ├── StockRemain.jsx
│   │   │   ├── InventoryManagement.jsx
│   │   │   └── SupplierManagement.jsx
│   │   ├── Complaints.jsx
│   │   ├── DailyStatus.jsx
│   │   ├── DenyManagement.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── QrPrint.jsx
│   │   ├── Register.jsx
│   │   ├── Settings.jsx
│   │   ├── StudentView.jsx
│   │   ├── Students.jsx
│   │   ├── UpdateStudent.jsx
│   │   └── Verify.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── firebase.js
│   │   └── supabase_connect.js
│   ├── styles/
│   │   └── login.css
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **HTML5 QR Scanner** - QR code scanning functionality

### Backend & Database
- **Supabase** - Backend-as-a-Service (BaaS)
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection
- **Real-time Subscriptions** - Live data updates

### APIs & Services
- **QR Server API** - QR code generation
- **Supabase JavaScript Client** - Database operations
- **RESTful Architecture** - API design

## 👥 User Roles

### Cafeteria Manager
- Manage student meal access
- Track daily meal consumption
- Manage food inventory and suppliers
- Handle student complaints
- Generate QR codes for students
- View analytics and reports

### Student Dean
- Monitor overall student meal participation
- View institutional reports
- Access student profiles and history
- Oversee cafeteria operations

## 📱 Key Functionalities

### Student Registration
- Complete student information collection
- Automatic QR code generation
- Batch and department management
- Emergency contact information

### QR Code System
- Unique QR code for each student
- Printable meal cards
- Mobile-friendly scanning
- Real-time verification

### Meal Verification
- Camera-based QR scanning
- Automatic meal type detection (breakfast/lunch/dinner)
- Duplicate meal prevention
- Real-time status updates

### Inventory Management
- Food item registration
- Consumption prediction algorithms
- Expiry date tracking
- Supplier management
- Stock level monitoring

### Reporting & Analytics
- Daily meal participation reports
- Student attendance tracking
- Inventory consumption analytics
- Historical data analysis

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration
Update `src/services/supabase_connect.js` with your project details:
```javascript
const supabaseUrl = "https://your-project.supabase.co"
const supabaseKey = "your-anon-key"
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **Supabase Hosting**: Use Supabase's built-in hosting
- **Traditional Hosting**: Upload the `dist` folder to any web server

## 📊 Database Schema Overview

### Core Tables
- **students**: Main student information and profiles
- **meal_records**: Individual meal consumption records
- **denied_students**: Access control and restrictions
- **food_inventory**: Food stock and inventory management
- **suppliers**: Vendor and supplier information
- **complaints**: Student feedback and issue tracking

### Relationships
- Students ↔ Meal Records (One-to-Many)
- Students ↔ Denied Students (One-to-Many)
- Food Inventory ↔ Stock Transactions (One-to-Many)
- Students ↔ Complaints (One-to-Many)

## 🔐 Security Features

- Row Level Security (RLS) in Supabase
- QR code data encryption
- Role-based access control
- Input validation and sanitization
- Secure API endpoints
- Protected routes in frontend

## 📈 Performance Optimizations

- React lazy loading for components
- Efficient database queries with indexes
- Real-time updates with Supabase subscriptions
- Optimized image loading
- Minimal bundle size with code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- Mobile application development
- Advanced analytics dashboard
- Integration with university ERP systems
- Biometric authentication
- Meal planning and scheduling
- Waste management tracking
- Nutritional analysis
- Multi-language support

## 🙏 Acknowledgments

- Supabase for the excellent backend service
- React community for comprehensive documentation
- Tailwind CSS for the utility-first approach
- Vite team for the fast build tool

---

**Developed with ❤️ for Educational Institutions**

For more information, visit the [GitHub Repository](https://github.com/your-username/meal-card-system) or contact the development team.