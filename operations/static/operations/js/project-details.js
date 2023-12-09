$(document).ready(function () {

    let project = null;
    let staffData = null;

    function goBack() {
        window.history.back();
    }

    function updateProjectData() {
        console.log(project);
        $('#project-name').html(project.project_name);
        let clientTypeName = "";
        if (project.client !== null) {
            if (project.client.client_type !== null) {
                clientTypeName = project.client.client_type.name;
            }
        }
        $('#project-client-type').html(clientTypeName);
        $('#project-status').html(project.p_type);
        const projectBudget = project.project_budget === "" || project.project_budget === null ? "N/A" : `$${project.project_budget}`;
        $('#project-budget').html(projectBudget);
        const startDate = project.start_date === null ? "N/A" : moment(project.start_date, 'YYYY-MM-DD').format('MMMM D, YYYY');
        const endDate = project.end_date === null ? "N/A" : moment(project.end_date, 'YYYY-MM-DD').format('MMMM D, YYYY');
        $('#project-start-date').html(startDate);
        $('#project-end-date').html(endDate);
    }

    async function fetchProject(projectId) {
        const response = await apiClient.get('/custom-admin/operations/project/api/' + projectId);
        project = response.data;
        updateProjectData();
    }

    let projectId = $('#project-id').val();

    fetchProject(projectId);

    $('#btn-back').click(function (e) {
        e.preventDefault();
        goBack();
    });

    // Project staff

    function updateEmployeeTable() {
        if (staffData.employees.length === 0) {
            $('#employee-table').hide();
            $('#id_no_employees').show();
        } else {
            let rowsHtml = '';
            for (let i = 0; i < staffData.employees.length; i++) {
                rowsHtml += `<tr>
                            <th>
                                <a href="#" class="dropmenu">
                                    <img src="assets/images/menudot.svg" alt=""/>
                                </a>${staffData.employees[i].employee_name}
                            </th>
                            <td>${staffData.employees[i].project_role}</td>
                        </tr>`;
            }
            $('#employee-table').show();
            $('#id_no_employees').hide();
            $('#employee-table').find('tbody').html(rowsHtml);
        }
    }

    function updateContractorsTable() {
        if (staffData.contractors.length === 0) {
            $('#contractor-table').hide();
            $('#id_no_contractors').show();
        } else {
            let rowsHtml = '';
            for (let i = 0; i < staffData.contractors.length; i++) {
                rowsHtml += `<tr>
                            <th>
                                <a href="#" class="dropmenu">
                                    <img src="assets/images/menudot.svg" alt=""/>
                                </a>${staffData.contractors[i].contractor_name}
                            </th>
                            <td>${staffData.contractors[i].contractor_role}</td>
                        </tr>`;
            }
            $('#id_no_contractors').hide();
            $('#contractor-table').show();
            $('#contractor-table').find('tbody').html(rowsHtml);
        }
    }

    function updateStaffTables() {
        updateContractorsTable();
        updateEmployeeTable();
    }

    async function getProjectStaff() {
        const response = await apiClient.get('/custom-admin/operations/project/api/' + projectId + '/staff');
        staffData = response.data;
        updateStaffTables();
    }


    getProjectStaff();

    // End Project staff

    // Project add / edit

    let currentOperation = 'add';

    function showValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += '<li>* ' + errorData[key][i] + '</li>';
            }
            $('#id_error_' + key).html(errorHtml);
        }
    }

    function resetForm() {
        $('#id_project_name').val('');
        $('#id_client').val('');
        $('#id_project_type').val('');
        $('#id_start_date').val('');
        $('#id_end_date').val('');
        $('#id_project_budget').val('');
        $('#id_billing_structure').val('');
    }

    function fillUpForm(project) {
        $('#id_client').val(project.client_id);
        $('#id_project_name').val(project.project_name);
        $('#id_project_type').val(project.project_type);
        $('#id_start_date').val(project.start_date);
        $('#id_end_date').val(project.end_date);
        $('#id_project_budget').val(project.project_budget);
        $('#id_billing_structure').val(project.billing_structure);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add New Project');
            $('#id_btn_project_add').html('Add Project');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit Project');
            $('#id_btn_project_add').html('Update Project');
        }
        $('#modal-project').modal('show');
    }

    $('#btn-project-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addProject(data) {
        const resp = await apiClient.post('/custom-admin/operations/project/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            $('#modal-project').modal('hide');
            resetForm();
            goBack();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editProject(data) {
        const resp = await apiClient.patch('/custom-admin/operations/project/api/' + project.id, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            project = resp.data;
            const pType = project.p_type;
            project.p_type = resp.data.project_type;
            project.project_type = pType;
            project.billing_structure = resp.data.b_structure;
            $('#modal-project').modal('hide');
            resetForm();
            updateProjectData();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_project_add').on('click', function () {
        $('.error_container').html('');
        let data = {
            client_id: $('#id_client').val(),
            project_name: $('#id_project_name').val(),
            project_type: $('#id_project_type').val(),
            start_date: $('#id_start_date').val(),
            end_date: $('#id_end_date').val(),
            project_budget: $('#id_project_budget').val(),
            billing_structure: $('#id_billing_structure').val()
        };
        if (currentOperation === 'add') {
            addProject(data);
        } else if (currentOperation === 'edit') {
            editProject(data);
        }
    });

    $('#btn-group-project-details-container').on('click', '#btn-project-edit', async function (e) {
        e.preventDefault();
        fillUpForm(project);
        showModal('edit');
    });

    $('#btn-group-project-details-container').on('click', '#btn-project-delete', function (e) {
        e.preventDefault();
        $('#id_selected_project').val($(this).attr('data-id'));
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const response = await apiClient.delete('/custom-admin/operations/project/api/' + project.id);
        $('#modal-delete').modal('hide');
        goBack();
    });

    // End Project add / end

});
