/* eslint-disable */
import React, { useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { history, Role } from './helpers';
import { alertActions } from './actions';
import { PrivateRoute } from './components';

import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import ConfirmEmail from './views/ConfirmEmail';
import RecoverPassword from './views/recoverPassword';
import ResetPassword from './views/resetPassword';
import RequestResetPwd from './views/RequestResetPwd';

//Perfil
import ProfilePage from './views/profile/ProfilePage';
//Sedes 
import AgencyListPage from './views/agency/AgencyList';
import AgencyCreatePage from './views/agency/AgencyCreate';
import AgencyUpdatePage from './views/agency/AgencyUpdate';
//Carreras
import CareerListPage from './views/career/CareerList';
import CareerCreatePage from './views/career/CareerCreate';
import CareerUpdatePage from './views/career/CareerUpdate';
//Logs
import LogsEmailListPage from './views/logEmails/LogEmailsList';
//Materias
import MatterListPage from './views/matter/MatterList';
import MatterCreatePage from './views/matter/MatterCreate';
import MatterUpdatePage from './views/matter/MatterUpdate';
//Profesores
import TeacherListPage from './views/teacher/TeacherList';
import TeacherCreatePage from './views/teacher/TeacherCreate';
import TeacherMatterPage from './views/teacher/TeacherMatter';
import TeacherUpdatePage from './views/teacher/TeacherUpdate';
import UserPwdPage from './views/teacher/UserPwd';
//Estudiantes
import StudentListPage from './views/student/StudentList';
import StudentUpdatePage from './views/student/StudentUpdate';
import ConstancyPdf from './views/student/ConstancyPdf';
import ReportScoreRequestPage from './views/student/ReportScoreRequest';
import ReportScorePdfPage from './views/student/ReportScorePdf';

//Admin
import AdminListPage from './views/admin/AdminList';
import AdminCreatePage from './views/admin/AdminCreate';
import AdminUpdatePage from './views/admin/AdminUpdate';

//Inscripciones
import InscriptionCreatePage from './views/inscription/InscriptionCreate';
import InscriptionListPage from './views/inscription/InscriptionList';
import InscriptionUpdatePage from './views/inscription/InscriptionUpdate';

import InscriptionCustomPage from './views/inscription/InscriptionCustom';

//Archivos
import FileCreatePage from './views/file/FileCreate';
import FileListPage from './views/file/FileList';
import FileListUserPage from './views/file/FileListUser';
import FileListAdminPage from './views/file/FileListAdmin';

//Calificaciones
import ScoreStudentListPage from './views/score/ScoreStudentList';
import ScoreUpdatePage from './views/score/ScoreUpdate';
import ScoreStudentPage from './views/score/ScoreStudent';
import ScoreLogPage from './views/score/ScoreLog';
import ScoreRequestPage from './views/score/ScoreRequest';
import KardexPdfPage from './views/score/KardexPdf';
import ScoreAdminPage from './views/score/ScoreAdmin';

//ofertas
import OfferListPage from './views/offer/OfferList';
import OfferCreatePage from './views/offer/OfferCreate';
//Reporte de ofertas historial
import OfferReportPage from './views/offer/OfferReport';

//Referencias
import ReferenceAdminPage from './views/reference/ReferenceAdmin';
import ReferenceApprovePage from './views/reference/ReferenceApprove';
import ReferenceStudentPage from './views/reference/ReferenceStudent';
import ReferencePdfPage from './views/reference/ReferencePdf';

//documentos
import DocCreatePage from './views/docs/DocCreate';
import DocListPage from './views/docs/DocList';
import DocDetailPage from './views/docs/DocDetail';
import DocListAminPage from './views/docs/DocListAmin';

//Notificacaciones
import NotificationCreatePage from './views/notification/notificationCreate';
import NotificationAdminPage from './views/notification/notificationAdmin';
import NotificationTeacherPage from './views/notification/notificationTeacher';
import NotificationDetailPage from './views/notification/notificationDetail';
import NotificationReportPage from './views/notification/notificationReport';
import NotificationUpdatePage from './views/notification/notificationUpdate';

//Grupos
import GroupListPage from './views/group/GroupList';
import GroupCreatePage from './views/group/GroupCreate';

//Horarios
import TimeTableCreatePage from './views/timetable/TimeTableCreate';
import TimeTableUpdatePage from './views/timetable/TimeTableUpdate';
import TimeTableListPage from './views/timetable/TimeTableList';
import TimeTableUserPage from './views/timetable/TimeTableUser';
import NotFoundPage from './views/404';

import './assets/css/timetable.css';

function App() {
  
	const dispatch = useDispatch();

	useEffect(() => {
        history.listen((location, action) => {
            // clear alert on location change
            dispatch(alertActions.clear());
        });
    }, []);


	return (
        <Router history={history}>
            <Switch>

                <Route exact path="/" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/confirm/:token" component={ConfirmEmail}/>
                <Route path="/recover" component={RecoverPassword} />
                <Route path="/restore/:token" component={ResetPassword} />
                <Route path="/requestpwd/:token" component={RequestResetPwd} />

                <PrivateRoute path="/home" component={HomePage} />
                <PrivateRoute path="/profile" component={ProfilePage} />
                {/* Admin */}
                <PrivateRoute path="/users" roles={[Role.Admin]} component={AdminListPage} />
                <PrivateRoute path="/register-user" roles={[Role.Admin]} component={AdminCreatePage} />
                <PrivateRoute path="/users-update" roles={[Role.Admin]} component={AdminUpdatePage} />
                {/* Sedes */}
                <PrivateRoute path="/agency" roles={[Role.Admin]} component={AgencyListPage} />
                <PrivateRoute path="/register-agency" roles={[Role.Admin]} component={AgencyCreatePage} />
                <PrivateRoute path="/update-agency" roles={[Role.Admin]} component={AgencyUpdatePage} />
                {/* Carreras */}
                <PrivateRoute path="/career" roles={[Role.Admin]} component={CareerListPage} />
                <PrivateRoute path="/register-career" roles={[Role.Admin]} component={CareerCreatePage} />
                <PrivateRoute path="/update-career" roles={[Role.Admin]} component={CareerUpdatePage} />
                {/* Materias */}
                <PrivateRoute path="/matter" roles={[Role.Admin]} component={MatterListPage} />
                <PrivateRoute path="/register-matter" roles={[Role.Admin]} component={MatterCreatePage} />
                <PrivateRoute path="/update-matter" roles={[Role.Admin]} component={MatterUpdatePage} />
                {/* Profesores*/}
                <PrivateRoute path="/teacher" roles={[Role.Admin]} component={TeacherListPage} />
                <PrivateRoute path="/register-teacher" roles={[Role.Admin]} component={TeacherCreatePage} />
                <PrivateRoute path="/teacher-matter" roles={[Role.Admin]} component={TeacherMatterPage} />
                <PrivateRoute path="/teacher-update" roles={[Role.Admin]} component={TeacherUpdatePage} />
                <PrivateRoute path="/teacher-reset" roles={[Role.Admin]} component={UserPwdPage} />
                {/* Estudiantes */}
                <PrivateRoute path="/students" roles={[Role.Admin]} component={StudentListPage} />
                <PrivateRoute path="/student-update" roles={[Role.Admin]} component={StudentUpdatePage} />
                <PrivateRoute path="/constancy" roles={[Role.Admin]} component={ConstancyPdf} />
                <PrivateRoute path="/report-score-request" roles={[Role.Admin]} component={ReportScoreRequestPage} />
                <PrivateRoute path="/view-report-score" roles={[Role.Admin]} component={ReportScorePdfPage} />
                {/* Inscripciones */}
                <PrivateRoute path="/inscriptions" roles={[Role.Admin]} component={InscriptionListPage} />
                <PrivateRoute path="/register-inscription" roles={[Role.Admin]} component={InscriptionCreatePage} />
                <PrivateRoute path="/update-inscription" roles={[Role.Admin]} component={InscriptionUpdatePage} />
                <PrivateRoute path="/custom-inscription" roles={[Role.Admin]} component={InscriptionCustomPage} />
                {/* Archivos */}
                <PrivateRoute path="/upload-file" roles={[Role.Admin, Role.Teacher]} component={FileCreatePage} />
                <PrivateRoute path="/files" roles={[Role.Admin, Role.Teacher]} component={FileListPage} />
                <PrivateRoute path="/files-user" roles={[Role.Teacher, Role.Student]} component={FileListUserPage} />
                <PrivateRoute path="/files-admin" roles={[Role.Admin]} component={FileListAdminPage} />
                {/* Documentos */}
                <PrivateRoute path="/upload-document" roles={[Role.Admin]} component={DocCreatePage} />
                <PrivateRoute path="/list-document" roles={[Role.Student]} component={DocListPage} />
                <PrivateRoute path="/detail-document" roles={[Role.Admin, Role.Student]} component={DocDetailPage} />
                <PrivateRoute path="/documents" roles={[Role.Admin]} component={DocListAminPage} />
                {/* Calificaciones */}
                <PrivateRoute path="/student-score" roles={[Role.Admin, Role.Teacher]} component={ScoreStudentListPage} />
                <PrivateRoute path="/update-score" roles={[Role.Admin, Role.Teacher]} component={ScoreUpdatePage} />
                <PrivateRoute path="/scores" roles={[Role.Student]} component={ScoreStudentPage} />
                <PrivateRoute path="/score-log" roles={[Role.Admin]} component={ScoreLogPage} />
                <PrivateRoute path="/score-request" roles={[Role.Student]} component={ScoreRequestPage} />
                <PrivateRoute path="/view-kardex" roles={[Role.Student]} component={KardexPdfPage} />
                <PrivateRoute path="/score-list" roles={[Role.Admin]} component={ScoreAdminPage} />
                {/* Ofertas */}
                <PrivateRoute path="/offer" roles={[Role.Admin]} component={OfferListPage} />
                <PrivateRoute path="/create-offer" roles={[Role.Admin]} component={OfferCreatePage} />
                <PrivateRoute path="/offer-history" roles={[Role.Admin]} component={OfferReportPage} />

                {/* Referencias */}
                <PrivateRoute path="/admin-references" roles={[Role.Admin]} component={ReferenceAdminPage} />
                <PrivateRoute path="/detail-reference" roles={[Role.Admin]} component={ReferenceApprovePage} />
                <PrivateRoute path="/references" roles={[Role.Student]} component={ReferenceStudentPage} />
                <PrivateRoute path="/view-reference" roles={[Role.Student]} component={ReferencePdfPage} />

                {/* Notificaciones */}
                <PrivateRoute path="/notification-create" roles={[Role.Admin]} component={NotificationCreatePage} />
                <PrivateRoute path="/notification-update" roles={[Role.Admin]} component={NotificationUpdatePage} />
                <PrivateRoute path="/admin-notifications" roles={[Role.Admin]} component={NotificationAdminPage} />
                <PrivateRoute path="/notifications" roles={[Role.Teacher]} component={NotificationTeacherPage} />
                <PrivateRoute path="/notification-detail" roles={[Role.Teacher]} component={NotificationDetailPage} />
                <PrivateRoute path="/notification-report" roles={[Role.Admin]} component={NotificationReportPage} />
                <PrivateRoute path="/notification-update" roles={[Role.Admin]} component={NotificationReportPage} />

                {/* Grupos */}
                <PrivateRoute path="/groups" roles={[Role.Admin]} component={GroupListPage} />
                <PrivateRoute path="/register-group" roles={[Role.Admin]} component={GroupCreatePage} />

                {/* TimeTable */}
                <PrivateRoute path="/register-timetable" roles={[Role.Admin]} component={TimeTableCreatePage} />
                <PrivateRoute path="/update-timetable" roles={[Role.Admin]} component={TimeTableUpdatePage} />
                <PrivateRoute path="/timetable" roles={[Role.Admin]} component={TimeTableListPage} />
                <PrivateRoute path="/calendar" roles={[Role.Student, Role.Teacher]} component={TimeTableUserPage} />

                {/* Logs */}
                <PrivateRoute path="/log-emails" roles={[Role.Admin]} component={LogsEmailListPage} />
                <Route path="/404" component={NotFoundPage} />
                <Redirect from="*" to="/404" />
            </Switch>
           
        </Router>     
    );
}

export default App;
