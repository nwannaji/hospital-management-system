# Hospital Management System - Frontend Components

This directory contains all the React components for the Hospital Management System frontend.

## Component Structure

### Layout Components

- **Layout.jsx** - Main application layout with sidebar navigation and header
- **Dashboard.jsx** - Main dashboard with statistics and quick actions

### Modal Components

- **PatientModal.jsx** - Modal for adding/editing patients
- **AppointmentModalStyled.jsx** - Modal for scheduling appointments

### List Components

- **PatientsList.jsx** - Component for displaying and managing patients list

## Features

### International Healthcare Standards

- WCAG AA compliant color system
- International medical terminology
- Responsive design for global device compatibility
- Accessibility features (ARIA labels, keyboard navigation)

### Styling

- Tailwind CSS v4 with custom medical color palette
- Semantic color tokens for clinical status indicators
- Consistent design system across all components
- Dark mode support

### API Integration

- RESTful API client with error handling
- Real-time data fetching and updates
- Optimistic UI updates
- Loading states and error handling

## Color System

### Medical Colors

- `medical-primary` (#007BFF) - Medical Blue
- `medical-success` (#28A745) - Health Green
- `medical-warning` (#FFC107) - Alert Orange
- `medical-danger` (#DC3545) - Emergency Red
- `medical-info` (#17A2B8) - Info Cyan
- `medical-secondary` (#6F42C1) - Purple Accent

### Clinical Status Colors

- `critical` - Critical patient status
- `urgent` - Urgent medical attention required
- `stable` - Stable patient condition
- `recovery` - Patient in recovery
- `discharged` - Patient discharged

## Usage Examples

### Using a Component

```jsx
import PatientModal from "./components/PatientModal";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PatientModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={() => console.log("Patient created")}
    />
  );
}
```

### API Integration

```jsx
import { api } from "../api";

// Fetch patients
const patients = await api.getPatients();

// Create patient
const patient = await api.createPatient(patientData);
```

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast ratios (WCAG AA compliant)

## Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interfaces
- Adaptive typography
- Optimized for various screen sizes

## Development Notes

- All components use React hooks for state management
- Error boundaries for graceful error handling
- Loading states for better UX
- Form validation and error messages
- Consistent prop interfaces
