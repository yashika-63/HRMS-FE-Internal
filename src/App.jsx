
import React, { useState, useEffect, } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AddEmp from './Components/Employees/AddEmployee.jsx';
import Project from './Components/Project/Project.jsx';
import AssignEmployee from './Components/Employees/AssignEmployee.jsx';
import ListProject from './Components/Project/ListProject.jsx';
import UpdateProj from './Components/Project/UpdateProject.jsx';
import ListEmp from './Components/Employees/ListEmployee.jsx';
import UpdateEmp from './Components/Employees/UpdateEmployee.jsx';
import SAPUndertaking from './Components/Onboarding/SAPUndertaking.jsx';
import ITRecruitment from './Components/Onboarding/ITRecruitment.jsx';
import ITAsset from './Components/Onboarding/ITAsset.jsx';
import Sidebar from './Components/Sidebar.jsx';
import OnBording from './Components/Onboarding/OnBordingPortal.jsx';
import SavedUndertaking from './Components/Onboarding/SAPUndertaking.jsx';
import View from './Components/Extra/View.jsx';
import TimeSheet from './Components/TimeSheet/TimeSheet.jsx';
import MasterPage from './Components/MasterDataManagement/MasterPage.jsx'
import HireChecklist from './Components/Onboarding/HireChecklist.jsx';
import EducationForm from './Components/Employees/EducationForm.jsx';
// import Registration1 from './Components/Registration1'
import ExpenseMan from './Components/Expense/ExpenseManagement.jsx';
import EmployeeOverview from './Components/Employees/EmployeeOverview.jsx';
import LeaveDashboard from './Components/Leaves/LeaveDashboard.jsx';
import AdminDashboard from './Components/Admin/AdminDashboard.jsx'; // Import your OnBoardingView component
import EmployeeHistory from './Components/Employees/EmployeeHistory.jsx';
import BankDetails from './Components/Employees/BankDetails.jsx';
import Login from './Components/Login/Login.jsx';
import CreateWorkflow from './Components/Workflow/CreateWorkflow.jsx';
import AllRequests from './Components/WorkflowMain/AllRequests.jsx';
import Registration from './Components/Login/Registration.jsx';
import CreateExpenseManagement from './Components/Expense/CreateExpenseManagement.jsx';
import TimesheetDashboard from './Components/TimeSheet/TimeSheetDashboard.jsx';
import ProjectOverview from './Components/Project/ProjectOverview.jsx';
import ViewLeaveApplication from './Components/Leaves/ViewLeave.jsx';
import ViewExpense from './Components/Expense/ViewExpense.jsx';
import ActiveEmp from './Components/Employees/ActiveEmployees.jsx';
import ViewWorkflow from './Components/Workflow/ViewWorkflow.jsx';
import UpdateWorkflow from './Components/Workflow/UpdateWorkflow.jsx';
import EnrollmentDashboard from './Components/Dashboard/EnrollmentDashboard.jsx';
import Documents from './Components/Documents/Documents.jsx';
import CTCBreakdown from './Components/Configuration/CompanyConfiguration.jsx';
import CompanyConfiguration from './Components/Configuration/CompanyConfiguration.jsx';
import PayrollDashboard from './Components/Payroll/PayrollDashboard.jsx';
import ConfigScreen from './Components/Configuration/CompanyLevelConfiguration.jsx';
import AdminViewTimesheet from './Components/TimeSheet/AdminViewTimesheet.jsx';
import PercentageAdjustment from './Components/Configuration/PercentageAdjustment.jsx';
import EmployeeLevelConfiguration from './Components/Configuration/EmployeeLevelConfiguration.jsx';
import CompanyDayOff from './Components/Configuration/CompanyDayOff.jsx';
import CtcAttributes from './Components/CTC/CtcAttributes.jsx';
import EmployeeConfiguration from './Components/Configuration/EmployeeConfiguration.jsx';
import Attendance from './Components/Configuration/Attendance.jsx';
import Payslip from './Components/Configuration/Payslip.jsx';
import ViewCTC from './Components/CTC/ViewCTC.jsx';
import ResetPasswordPage from './Components/Login/Resetpassword.jsx';
import EmployeeDetails from './Components/Configuration/EmpoyeeConfig.jsx';
import ProcessedPayRollTransection from './Components/Payroll/ProcessedPayRollTransection.jsx';
import PayrollTransactionScreen from './Components/Payroll/PayrollTransectionScreen.jsx';
import CtcGenration from './Components/CTC/CtcGenration.jsx';
import ViewDocuments from './Components/Documents/ViewDocuments.jsx';
import { ToastContainer } from 'react-toastify';
import OrganizationalGoal from './Components/Pms/OrganizationSetup/OrganizationalGoal.jsx';
import OrganizationSetup from './Components/Pms/OrganizationSetup/OrganizationSetup.jsx';
import OrganizationalKPI from './Components/Pms/OrganizationSetup/OrganizationalKPI.jsx';
import EmployeeLevelGoal from './Components/Pms/EmployeeSetup/EmployeeLevelGoal.jsx';
import EmployeeSetup from './Components/Pms/EmployeeSetup/EmployeeSetup.jsx';
import Team from './Components/Pms/Team.jsx';
import FeedbackSetup from './Components/Pms/Feedback/FeedbackSetup.jsx';
import SheduledFeedback from './Components/Pms/Feedback/SheduledFeedback.jsx';
import SheduledFeedbackKpi from './Components/Pms/Feedback/SheduleFeedbackKpi.jsx';
import ErrorBoundary from './Components/Errorboundary.jsx';
import LeaveApplication from './Components/Leaves/LeaveApplication.jsx';
import UpdateLeaveApplication from './Components/Leaves/UpdateLeave.jsx';
import EmployeeGoalOverview from './Components/Pms/Feedback/EmployeeGoalOverview.jsx';
import EmployeeAppraisalDashboard from './Components/Pms/Dashborad/EmployeeAppraisalDashboard.jsx';
import EmployeeGoalAnalytic from './Components/Pms/Dashborad/EmployeeGoalAnalytic.jsx';
import EmployeeKpiAnalytic from './Components/Pms/Dashborad/EmployeeKpiAnalytic.jsx';
import EmployeeDashboard from './Components/EmployeeDashboard/EmployeeDashboard.jsx';
import RequestedFeedback from './Components/Pms/Feedback/Requestedfeedback.jsx';
import LeaveApprovalRequest from './Components/ApprovalRequest/LeaveApprovalRequest.jsx';
import ExpenseApprovalRequest from './Components/ApprovalRequest/ExpenseApprovalRequest.jsx';
import FeedbackApprovalrequest from './Components/ApprovalRequest/FeedbackApprovalRequest.jsx';
import Requesthandler from './Components/ApprovalRequest/RequestHandler.jsx';
import Admindashboard from './Components/Admin/AdminDashboard.jsx';
import AppraisalForm from './Components/Pms/Appraisal.jsx/AppraisalForm.jsx';
import AppraisalApprovalRequest from './Components/ApprovalRequest/AppraisalApprovalRequest.jsx';
import ViewAppraisal from './Components/Pms/Appraisal.jsx/ViewAppraisal.jsx';
import EmployeeTrainingForm from './Components/Training/EmployeeTrainingForm.jsx';
import TrainingApprovalRequest from './Components/ApprovalRequest/TrainingApprovalRequest.jsx';
import ViewTraining from './Components/Training/ViewTraining.jsx';
import EmployeeView from './Components/Pms/EmployeeSetup/EmployeeView.jsx';
import ManagerView from './Components/Pms/EmployeeSetup/MangaerView.jsx';
import EmployeePerformance from './Components/Pms/Dashborad/EmployeePerformance.jsx';
import CompanyConfig from './Components/Configuration/CompanyConfig.jsx';
import SpinnerPage from './Components/Configuration/SpinnerPage.jsx';
import TimesheetApprovalRequest from './Components/ApprovalRequest/TimesheetApprovalRequest.jsx';
import ManagerViewOfTraining from './Components/Training/ManagerViewOfTraining.jsx';
import ModerateRating from './Components/Pms/ModerateRating.jsx';
import TimesheetSetup from './Components/TimeSheet/TimeSheetSetup.jsx';
import PreRegistration from './Components/PreOnboarding/PreRegistration.jsx';
import MRFform from './Components/Recruitment/MRFform.jsx';
import ConfirmationRequest from './Components/ApprovalRequest/ConfirmationRequest.jsx';
import PreLogin from './Components/PreOnboarding/PreLogin.jsx';
import CandidatePortal from './Components/CandidatePortal/Candidateportal.jsx';
import ConfirmationLetter from './Components/Confirmation/Confirmation.jsx';
import PreTopBar from './Components/PreTopBar.jsx';
import Offer from './Components/PreOnboarding/Offer.jsx';
import PersonalDetails from './Components/CandidatePortal/PersonalDetails.jsx';
import CTC from './Components/PreOnboarding/CTC.jsx';
import OfferLetter from './Components/CandidatePortal/OfferLetter.jsx';
import TemplateCreation from './Components/Templates/TemplateCreation.jsx';
import CompanyDocument from './Components/CompanySetting/CompanyDocument.jsx';
import TicketsView from './Components/Ticketgenration/TicketsView.jsx';
import SessionManager from './SessionManager.jsx';
import Tickets from './Components/CandidatePortal/Tickets.jsx';
import Jd from './Components/Recruitment/Jd.jsx';
import CandidateRegistration from './Components/Recruitment/CandidateRegistration.jsx';
import RecruitmentPortal from './Components/Recruitment/RecruitmentPortal.jsx';
import ShortlistedCandidates from './Components/Recruitment/ShortlistedCandidates.jsx';
import InterviewCalendar from './Components/Recruitment/InterviewCalendar.jsx';
import Career from './Components/CareerPage/Career.jsx';
import InterviewCalendarView from './Components/Recruitment/InterviewCalendarView.jsx';
import AllActiveConfirmation from './Components/Confirmation/AllActiveConfirmation.jsx';
import ConfirmationView from './Components/Confirmation/ConfirmationView.jsx';
import AllTrainings from './Components/Trainings/AllTrainings.jsx';
import EmployeeInduction from './Components/Induction/EmployeeInduction.jsx';
import ListOfCandidates from './Components/PreOnboarding/ListOfCandidates.jsx';
import EmployeeAssetForm from './Components/Asset/EmployeeAssetForm.jsx';
import Assets from './Components/Employees/Assets.jsx';
import LeaveBucketCreation from './Components/Leaves/LeaveBucketCreation.jsx';
import AssignInduction from './Components/Induction/AssignInduction.jsx';
import InductionList from './Components/Induction/InductionList.jsx';
import TrainingCertificate from './Components/Trainings/TrainingCertificate.jsx';
import TrainningSetup from './Components/Trainings/TrainningSetup.jsx';
import OffBoarding from './Components/OffBoarding/OffBoarding.jsx';
import EmployeeExitProcess from './Components/OffBoarding/Employee Offborading/EmployeeExitProcess.jsx';
import AiTdsCalculator from './Components/CTC/AiTdsCalculator.jsx';
import ExpenseReport from './Components/Expense/ExpenseReport.jsx';
import InductionHR from './Components/Induction/InductionHR/InductionHR.jsx';
import TrainingHR from './Components/Trainings/TrainingHR/TrainingHR.jsx';
import ReportsFilters from './Components/Reports/ReportsFilters.jsx';
import CompanySettings from './Components/CompanySetting/CompanySettings.jsx';
import TransferList from './Components/Transfer/TransferList.jsx';
// import GlobalSearchBar from './globalSearchBar.jsx';
const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('Role'));
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [preLoginToken, setPreLoginToken] = useState(localStorage.getItem('PreLoginToken'));

  const handleSetToken = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.removeItem('PreLoginToken'); // Clear pre-login token if regular login happens
  };
  const handleSetPreLoginToken = (preLoginToken) => {
    setPreLoginToken(preLoginToken);
    localStorage.setItem('PreLoginToken', preLoginToken);
  };

  useEffect(() => {
    setRole(localStorage.getItem('Role'));
  }, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedPreLoginToken = localStorage.getItem('PreLoginToken');

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedPreLoginToken) {
      setPreLoginToken(savedPreLoginToken);
    }
  }, []);


  const PrivateRoute = ({ children, allowedRoles }) => {
    if (!token) {
      return <Navigate to="/Login" />;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" />;
    }
    return children;
  };

  // const toggleTheme = () => {
  //   setIsDarkTheme(!isDarkTheme);
  //   console.log("Toggling theme. Current theme:", isDarkTheme ? "Dark" : "Light");
  // };
  // useEffect(() => {
  //   const mainElement = document.querySelector('main');
  //   const coreContainerElement = document.querySelector('.coreContainer');

  //   if (mainElement) {
  //     if (isDarkTheme) {
  //       mainElement.classList.add('dark-theme');  
  //       mainElement.classList.remove('light-theme'); 
  //     } else {
  //       mainElement.classList.add('light-theme');  
  //       mainElement.classList.remove('dark-theme'); 
  //     }
  //   }

  //   if (coreContainerElement) {
  //     if (isDarkTheme) {
  //       coreContainerElement.classList.add('dark-theme'); 
  //       coreContainerElement.classList.remove('light-theme'); 
  //     } else {
  //       coreContainerElement.classList.add('light-theme');
  //       coreContainerElement.classList.remove('dark-theme');
  //     }
  //   }

  //   localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  // }, [isDarkTheme]);
  // useEffect(() => {
  //   const savedTheme = localStorage.getItem('theme');
  //   if (savedTheme === 'dark') {
  //     setIsDarkTheme(true); 
  //   } else {
  //     setIsDarkTheme(false);  
  //   }
  // }, []);
  const routes = [
    { title: 'Add Employee', path: '/AddEmp' }
  ];

  return (
    <>
      <Router>
        {/* <div className={isDarkTheme ? 'dark-theme' : 'light-theme'}> */}


        {token ? (
          <>
            <div>
              {/* <GlobalSearchBar routes={routes} /> */}
              {/* <ToastContainer /> */}
              <ErrorBoundary>
                {/* <SessionManager/> */}
                <Sidebar>
                  {/* <Sidebar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} > */}
                  <Routes>

                    {/* <Route path="/Registration1" element={<Registration1 />} /> */}
                    <Route path="/AddEmp" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><AddEmp /> </PrivateRoute>} />
                    <Route path="/Project" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Project /> </PrivateRoute>} />
                    <Route path="/AssignEmp" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><AssignEmployee /></PrivateRoute>} />
                    <Route path="/ListProject" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ListProject /></PrivateRoute>} />
                    <Route path="/UpdateProj" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><UpdateProj /></PrivateRoute>} />
                    <Route path="/update/:id" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><UpdateProj /></PrivateRoute>} />
                    <Route path="/ListEmp" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ListEmp /> </PrivateRoute>} />
                    <Route path="/LeaveApplication" element={<LeaveApplication />} />
                    <Route path="/LeaveApplication/:id" element={<LeaveApplication />} />
                    <Route path="/UpdateEmp" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><UpdateEmp /> </PrivateRoute>} />
                    <Route path="/UpdateEmp/:id" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><UpdateEmp /> </PrivateRoute>} />
                    <Route path="/SAPUndertaking" element={<SAPUndertaking />} />
                    <Route path="/SAPUndertaking/:id" element={<SAPUndertaking />} />
                    <Route path="/ITRecruitment" element={<ITRecruitment />} />
                    <Route path="/ITRecruitment/:id" element={<ITRecruitment />} />
                    <Route path="/ITAsset" element={<ITAsset />} />
                    <Route path="/ITAsset/:id" element={<ITAsset />} />
                    <Route path="/SavedUndertaking" element={<SavedUndertaking />} />
                    <Route path="/SavedUndertaking/:id" element={<SavedUndertaking />} />
                    <Route path="/View" element={<View />} />
                    <Route path="/View/:id" element={<View />} />
                    <Route path="/TimeSheet" element={<TimeSheet />} />
                    <Route path="/MasterPage" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><MasterPage /> </PrivateRoute>} />
                    <Route path="/HireChecklist" element={<HireChecklist />} />
                    <Route path="/HireChecklist/:id" element={<HireChecklist />} />
                    <Route path="TimeSheet" element={<TimeSheet />} />
                    <Route path="/EducationForm/:id" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EducationForm /> </PrivateRoute>} />
                    <Route path='/BankDetails/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><BankDetails /> </PrivateRoute>} />
                    <Route path='/BankDetails' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><BankDetails /> </PrivateRoute>} />
                    <Route path="/ExpenseMan" element={<ExpenseMan />} />
                    <Route path="/EmployeeOverview" element={<EmployeeOverview />} />
                    <Route path="/EmployeeOverview/:id" element={<EmployeeOverview />} />
                    <Route path="/OnBordingPortal" element={<OnBording />} />
                    <Route path="/LeaveDashboard" element={<LeaveDashboard />} />
                    <Route path="/LeaveDashboard/:id" element={<LeaveDashboard />} />
                    <Route path="/AdminDashboard" element={<AdminDashboard />} />
                    <Route path="/EmployeeHistory" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeHistory /> </PrivateRoute>} />
                    <Route path="/EmployeeHistory/:id" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeHistory /> </PrivateRoute>} />
                    <Route path="/CreateWorkflow" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CreateWorkflow /></PrivateRoute>} />
                    <Route path="/ITAsset/:id" element={<ITAsset />} />
                    <Route path='/AllRequests' element={<AllRequests />} />
                    <Route path='/CreateExpenseManagement' element={<CreateExpenseManagement />} />
                    <Route path='/TimeSheetDashboard' element={<TimesheetDashboard />} />
                    <Route path='/TimeSheetDashboard/:id' element={<TimesheetDashboard />} />
                    <Route path='/Registration' element={<Registration />} />
                    <Route path='/Registration/:id' element={<Registration />} />
                    <Route path='/AssignEmp/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><AssignEmployee /> </PrivateRoute>} />
                    <Route path='/ProjectOverview/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ProjectOverview /> </PrivateRoute>} />
                    <Route path='/UpdateLeaveApplication/:id' element={<UpdateLeaveApplication />} />
                    <Route path='/ViewLeave/:id' element={<ViewLeaveApplication />} />
                    <Route path='/ViewExpense/:id' element={<ViewExpense />} />
                    <Route path='/ActiveEmp/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ActiveEmp /> </PrivateRoute>} />
                    <Route path='/ViewWorkflow/:id' element={<ViewWorkflow />} />
                    <Route path='/UpdateWorkflow' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><UpdateWorkflow /> </PrivateRoute>} />
                    <Route path='/AddEmp/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><AddEmp /> </PrivateRoute>} />
                    <Route path='/ActiveEmployees' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ActiveEmp /> </PrivateRoute>} />
                    <Route path='/EnrollmentDashboard' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EnrollmentDashboard /> </PrivateRoute>} />
                    <Route path='/Documents' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Documents /> </PrivateRoute>} />
                    <Route path='/Documents/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Documents /> </PrivateRoute>} />
                    <Route path='/ViewDocuments/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ViewDocuments /> </PrivateRoute>} />
                    <Route path='/ViewDocuments' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ViewDocuments /> </PrivateRoute>} />
                    <Route path='/CtcAttributes' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CTCBreakdown /> </PrivateRoute>} />
                    <Route path='/PayrollDashboard' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><PayrollDashboard /> </PrivateRoute>} />
                    <Route path='/ConfigScreen' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ConfigScreen /> </PrivateRoute>} />
                    <Route path='AdminViewTimesheet' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><AdminViewTimesheet /> </PrivateRoute>} />
                    <Route path='CompanyConfiguration' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CompanyConfiguration /> </PrivateRoute>} />
                    <Route path='/EmployeeLevelConfiguration' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeLevelConfiguration /> </PrivateRoute>} />
                    <Route path='/EmployeeLevelConfiguration/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeLevelConfiguration /> </PrivateRoute>} />
                    <Route path='/PercentageAdjustment' element={<PercentageAdjustment />} />
                    <Route path='/CtcGeneration' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CtcGenration /> </PrivateRoute>} />
                    <Route path='/CtcGeneration/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CtcGenration /> </PrivateRoute>} />
                    <Route path='CompanyDayOff' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CompanyDayOff /> </PrivateRoute>} />
                    <Route path='CtcAttributes ' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CtcAttributes /> </PrivateRoute>} />
                    <Route path='EmployeeConfiguration' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeConfiguration /> </PrivateRoute>} />
                    <Route path='/EmployeeConfig' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeDetails /> </PrivateRoute>} />
                    <Route path='/EmployeeConfig/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeDetails /> </PrivateRoute>} />
                    <Route path='Attendance' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Attendance /> </PrivateRoute>} />
                    <Route path='Payslip/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><Payslip /> </PrivateRoute>} />
                    <Route path='ViewCTC/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><ViewCTC /> </PrivateRoute>} />
                    <Route path='OrganizationalGoal' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><OrganizationalGoal /> </PrivateRoute>} />
                    <Route path='ProcessedPayRollTransection' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ProcessedPayRollTransection /> </PrivateRoute>} />
                    <Route path='PayrollTransactionScreen' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><PayrollTransactionScreen /> </PrivateRoute>} />
                    <Route path='OrganizationSetup' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><OrganizationSetup /> </PrivateRoute>} />
                    <Route path='OrganizationalKPI' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><OrganizationalKPI /> </PrivateRoute>} />
                    <Route path='EmployeeLevelGoal' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeLevelGoal /> </PrivateRoute>} />
                    <Route path='EmployeeSetup/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><EmployeeSetup /> </PrivateRoute>} />
                    <Route path='Team' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Team /> </PrivateRoute>} />
                    <Route path='FeedbackSetup/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><FeedbackSetup /> </PrivateRoute>} />
                    <Route path='SheduledFeedback/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><SheduledFeedback /> </PrivateRoute>} />
                    <Route path='SheduledFeedbackKpi/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><SheduledFeedbackKpi /> </PrivateRoute>} />
                    <Route path='EmployeeView' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeeView /></PrivateRoute>} />
                    <Route path='ManagerView/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ManagerView /></PrivateRoute>} />
                    <Route path='RequestedFeedback/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><RequestedFeedback /></PrivateRoute>} />
                    <Route path='EmployeeDashboard' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeeDashboard /></PrivateRoute>} />
                    <Route path='LeaveApprovalRequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><LeaveApprovalRequest /></PrivateRoute>} />
                    <Route path='ExpenseApprovalRequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ExpenseApprovalRequest /></PrivateRoute>} />
                    <Route path='FeedbackApprovalrequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><FeedbackApprovalrequest /></PrivateRoute>} />
                    <Route path='requestHandler' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><Requesthandler /></PrivateRoute>} />
                    <Route path='requestHandler' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><Requesthandler /></PrivateRoute>} />
                    <Route path='Admindashboard' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Admindashboard /></PrivateRoute>} />
                    <Route path='AppraisalForm' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><AppraisalForm /></PrivateRoute>} />
                    <Route path='AppraisalApprovalRequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><AppraisalApprovalRequest /></PrivateRoute>} />
                    <Route path='ViewAppraisal/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ViewAppraisal /></PrivateRoute>} />
                    <Route path='EmployeeTrainingForm' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeeTrainingForm /></PrivateRoute>} />
                    <Route path='TrainingApprovalRequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><TrainingApprovalRequest /></PrivateRoute>} />
                    <Route path='ViewTraining' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><ViewTraining /></PrivateRoute>} />
                    <Route path='EmployeeGoalAnalytic/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeeGoalAnalytic /></PrivateRoute>} />
                    <Route path='EmployeeAppraisalDashboard/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeeAppraisalDashboard /></PrivateRoute>} />
                    <Route path='EmployeeKpiAnalytic/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeeKpiAnalytic /></PrivateRoute>} />
                    <Route path='EmployeePerformance/:id' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><EmployeePerformance /></PrivateRoute>} />
                    <Route path='CompanyConfig' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CompanyConfig /></PrivateRoute>} />
                    <Route path='SpinnerPage' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><SpinnerPage /></PrivateRoute>} />
                    <Route path='TrainningSetup' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><TrainningSetup /></PrivateRoute>} />
                    <Route path='TimesheetApprovalRequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><TimesheetApprovalRequest /></PrivateRoute>} />
                    <Route path='ManagerViewOfTraining' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ManagerViewOfTraining /></PrivateRoute>} />
                    <Route path='ModerateRating' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ModerateRating /></PrivateRoute>} />
                    <Route path='TimeSheetSetup' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><TimesheetSetup /></PrivateRoute>} />
                    <Route path='PreRegistration' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><PreRegistration /></PrivateRoute>} />
                    <Route path='MRFform' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><MRFform /></PrivateRoute>} />
                    <Route path='ConfirmationRequest' element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><ConfirmationRequest /></PrivateRoute>} />
                    <Route path="/PreRegistration" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><PreRegistration /></PrivateRoute>} />
                    <Route path="/CTC" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><CTC /></PrivateRoute>} />
                    <Route path="/Confirmation/:id" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><ConfirmationLetter /></PrivateRoute>} />
                    <Route path="/Offer" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><Offer /></PrivateRoute>} />
                    {/* <Route path="/CandidatePortal" element={<CandidatePortal />} /> */}
                    <Route path="/OfferLetter" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><OfferLetter /></PrivateRoute>} />
                    <Route path="/TemplateCreation" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN"]}><TemplateCreation /></PrivateRoute>} />
                    <Route path="/CompanyDocument" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><CompanyDocument /></PrivateRoute>} />
                    <Route path="/PersonalDetails" element={<PersonalDetails />} />
                    <Route path="/TicketsView" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><TicketsView /></PrivateRoute>} />
                    <Route path="/Jd" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><Jd /></PrivateRoute>} />
                    <Route path="/CandidateRegistration/:id" element={<CandidateRegistration />} />
                    <Route path="/RecruitmentPortal/:id" element={<PrivateRoute allowedRoles={['ADMIN', "SUPERADMIN", "USER"]}><RecruitmentPortal /></PrivateRoute>} />
                    <Route path="/CandidateRegistration" element={<CandidateRegistration />} />
                    <Route path="/InterviewCalendar/:jobDescriptionId/:candidateId" element={<InterviewCalendar />} />
                    <Route path="/InterviewCalendarView/:id" element={<InterviewCalendarView />} />
                    <Route path='/AllActiveConfirmation' element={<AllActiveConfirmation />} />
                    <Route path='/ConfirmationView/:id' element={<ConfirmationView />} />
                    <Route path='EmployeeInduction/:id' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><EmployeeInduction /></PrivateRoute>} />
                    <Route path='TrainningSetup/:id' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><TrainningSetup /></PrivateRoute>} />
                    <Route path='/AllTrainings' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><AllTrainings /></PrivateRoute>} />
                    <Route path='/ListOfCandidates' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><ListOfCandidates /></PrivateRoute>} />
                    <Route path='/Assets/:id' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><Assets /></PrivateRoute>} />
                    <Route path='/EmployeeAssetForm' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><EmployeeAssetForm /></PrivateRoute>} />
                    <Route path='/LeaveBucketCreation' element={<PrivateRoute allowedRoles={['ADMIN']}><LeaveBucketCreation /></PrivateRoute>} />
                    <Route path='/CompanySettings' element={<PrivateRoute allowedRoles={['ADMIN']}><CompanySettings /></PrivateRoute>} />
                    <Route path='/InductionList' element={<PrivateRoute allowedRoles={['ADMIN']}><InductionList /></PrivateRoute>} />
                    <Route path='/TransferList' element={<PrivateRoute allowedRoles={['ADMIN']}><TransferList /></PrivateRoute>} />
                    <Route path='/TrainingCertificate' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><TrainingCertificate /></PrivateRoute>} />
                    <Route path='/OffBoarding' element={<PrivateRoute allowedRoles={['ADMIN']}><OffBoarding /></PrivateRoute>} />
                    <Route path='EmployeeExitProcess/:id' element={<PrivateRoute allowedRoles={['ADMIN', 'USER']}><EmployeeExitProcess /></PrivateRoute>} />
                    <Route path='/Career/:jobkey' element={<Career />} />
                    <Route path='/AiTdsCalculator' element={<PrivateRoute allowedRoles={['ADMIN']}><AiTdsCalculator /></PrivateRoute>} />
                    <Route path='/ExpeneseReport/:id' element={<PrivateRoute allowedRoles={['ADMIN']}><ExpenseReport /></PrivateRoute>} />
                    <Route path='/AiTdsCalculator' element={<PrivateRoute allowedRoles={['ADMIN']}><AiTdsCalculator /></PrivateRoute>} />
                    <Route path='/InductionHR' element={<PrivateRoute allowedRoles={['ADMIN']}><InductionHR /></PrivateRoute>} />
                    <Route path='/TrainingHR' element={<PrivateRoute allowedRoles={['ADMIN']}><TrainingHR /></PrivateRoute>} />
                    <Route path='/Reports' element={<PrivateRoute allowedRoles={['ADMIN']}><ReportsFilters /></PrivateRoute>} />
                  </Routes>
                </Sidebar>
              </ErrorBoundary>
              <ToastContainer />
            </div>
          </>

        ) : preLoginToken ? (
          <div>
            <ErrorBoundary>
              <PreTopBar />
              <Routes>

                <Route path="/PreLogin" element={<PreLogin />} />
                <Route path="/CandidatePortal" element={<CandidatePortal />} />
                <Route path="/PersonalDetails" element={<PersonalDetails />} />
                <Route path="/OfferLetter" element={<OfferLetter />} />
                <Route path="/Tickets" element={<Tickets />} />
              </Routes>
              <ToastContainer />
            </ErrorBoundary>
          </div>
        ) : (
          <Routes>
            <Route path="/Login" element={<Login setToken={handleSetToken} />} />
            <Route path="/PreLogin" element={<PreLogin handleSetPreLoginToken={handleSetPreLoginToken} />} />
            <Route path="/ResetPasswordPage" element={<ResetPasswordPage />} />
            <Route path='/Career/:jobkey' element={<Career />} />
            <Route path="*" element={<Navigate to="/Login" />} />

          </Routes>
        )}
      </Router >

    </>
  );
};

export default App;




