$(document).ready(function () {

    let project = null;
    let staffData = null;
    let availableStaff = null;
    let addedContractors = [];
    let addedEmployees = [];

    function goBack() {
        window.location.href = '/custom-admin/operations/project/';
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
            $('#employee-table').find('tbody').html('');
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
            $('#employee-table').find('tbody').html(rowsHtml);
            $('#employee-table').show();
            $('#id_no_employees').hide();
        }
    }

    function updateSelectedStaffHtml() {
        let staffHtml = '';
        for (let i = 0; i < addedContractors.length; i++) {
            staffHtml += `<div class="row">
                                <div class="col-sm-4">${addedContractors[i].contractor_name}</div>
                                <div class="col-sm-6">Contractor</div>
                                <div class="col-sm-2">
                                    <button class="btn-remove-contractor" 
                                        data-contractor-id="${addedContractors[i].id}">×
                                    </button>
                                </div>
                            </div>`;
        }
        for (let i = 0; i < addedEmployees.length; i++) {
            staffHtml += `<div class="row">
                                <div class="col-sm-4">${addedEmployees[i].employee_name}</div>
                                <div class="col-sm-6">Full time employee</div>
                                <div class="col-sm-2">
                                    <button class="btn-remove-employee" 
                                        data-employee-id="${addedEmployees[i].id}">×
                                    </button>
                                </div>
                            </div>`;
        }
        $('#staff-container').html(staffHtml);
    }

    function updateContractorsTable() {
        if (staffData.contractors.length === 0) {
            $('#contractor-table').hide();
            $('#contractor-table').find('tbody').html('');
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
            $('#contractor-table').find('tbody').html(rowsHtml);
            $('#contractor-table').show();
        }
    }

    function updateStaffTables() {
        updateContractorsTable();
        updateEmployeeTable();
        updateSelectedStaffHtml();
    }

    async function getProjectStaff() {
        const response = await apiClient.get('/custom-admin/operations/project/api/' + projectId + '/staff');
        staffData = response.data;
        updateStaffTables();
    }

    function updateAvailableStaffList() {
        const contractors = availableStaff.contractors;
        const employees = availableStaff.employees;
        let contractorsLisHtml = `<li><a class="back" href="#"><img
                                            src="/static/custom_admin_assets/images/chevron-left_minor-1.svg"
                                            alt=""/>
                                            Contractors</a>
                                        </li>`;
        for (let i = 0; i < contractors.length; i++) {
            contractorsLisHtml += `<li><a href="#" data-contractor-id="${contractors[i].id}" 
                                        class="btn-select-contractor">${contractors[i].contractor_name}</a>
                                   </li>`;
        }
        let employeeLisHtml = `<li><a class="back" href="#"><img
                                        src="/static/custom_admin_assets/images/chevron-left_minor-1.svg"
                                        alt=""/>
                                        Full time employees</a>
                                    </li>`;
        for (let i = 0; i < employees.length; i++) {
            employeeLisHtml += `<li><a href="#" data-employee-id="${employees[i].id}" 
                                    class="btn-select-employee">${employees[i].employee_name}</a>
                                </li>`;
        }
        $('#available-contractors-ul').html(contractorsLisHtml);
        $('#available-employees-ul').html(employeeLisHtml);
    }

    async function getAvailableStaff() {
        const response = await apiClient.get('/custom-admin/operations/project/api/' + projectId + '/available-staff');
        availableStaff = response.data;
    }

    getProjectStaff();

    $('#btn-add-staff').click(async function (e) {
        e.preventDefault();
        await getAvailableStaff();
        updateAvailableStaffList();
        addedEmployees = staffData.employees.slice(0);
        addedContractors = staffData.contractors.slice(0);
        updateSelectedStaffHtml();
        $('.selectdrop').hide();
        $('#editModalStaff').find('.sub-menu').css("left", "355px");
        $('#editModalStaff').modal('show');
    });

    // Staff pop up

    function getSelectedContractor(contractorId) {
        for(let i = 0; i < availableStaff.contractors.length; i++) {
            if (contractorId == availableStaff.contractors[i].id) {
                return availableStaff.contractors[i];
            }
        }
    }

    function addToContractors(selectedContractor) {
        let found = false;
        for(let i = 0; i < addedContractors.length; i++) {
            if(addedContractors[i].id == selectedContractor.id) {
                addedContractors.splice(i, 1);
                found = true;
                break;
            }
        }
        if (!found) {
            addedContractors.push(selectedContractor);
        }
    }

    $('#editModalStaff').on('click', '.btn-remove-contractor', function () {
        const contractorId = $(this).attr('data-contractor-id');
        for (let i = 0; i < addedContractors.length; i++) {
            if (contractorId == addedContractors[i].id) {
                addedContractors.splice(i, 1);
                break;
            }
        }
        updateSelectedStaffHtml();
    });

    $('#editModalStaff').on('click', '.btn-select-contractor', function () {
        const contractorId = $(this).attr('data-contractor-id');
        $(this).parent().toggleClass('selected-staff');
        const selectedContractor = getSelectedContractor(contractorId);
        addToContractors(selectedContractor);
        updateSelectedStaffHtml();
    });

    function getSelectedEmployee(employeeId) {
        for (let i = 0; i < availableStaff.employees.length; i++) {
            if(employeeId == availableStaff.employees[i].id) {
                return availableStaff.employees[i];
            }
        }
    }

    function addToEmployees(selectedEmployee) {
        let found = false;
        for (let i = 0; i < addedEmployees.length; i++) {
            if(addedEmployees[i].id == selectedEmployee.id) {
                addedEmployees.splice(i, 1);
                found = true;
                break;
            }
        }
        if (!found) {
            addedEmployees.push(selectedEmployee);
        }
    }

    $('#editModalStaff').on('click', '.btn-remove-employee', function () {
        const employeeId = $(this).attr('data-employee-id');
        console.log(employeeId);
        for (let i = 0; i < addedEmployees.length; i++) {
            if (employeeId == addedEmployees[i].id) {
                addedEmployees.splice(i, 1);
                break;
            }
        }
        updateSelectedStaffHtml();
    });

    $('#editModalStaff').on('click', '.btn-select-employee', function () {
        const employeeId = $(this).attr('data-employee-id');
        $(this).parent().toggleClass('selected-staff');
        const selectedEmployee = getSelectedEmployee(employeeId);
        addToEmployees(selectedEmployee);
        updateSelectedStaffHtml();
    });
    
    $('#editModalStaff').on('click', '#btn-update-project-staff', async function () {
        const contractorIds = addedContractors.map(c => c.id);
        const employeeIds = addedEmployees.map(e => e.id);
        const data = {
            contractor_ids: contractorIds,
            employee_ids: employeeIds
        };
        const resp = await apiClient.patch('/custom-admin/operations/project/api/' + projectId + '/staff/', data);
        staffData.employees = resp.data.employees;
        staffData.contractors = resp.data.contractors;
        updateStaffTables();
        $('#editModalStaff').modal('hide');
    });
    
     $('#editModalStaff').on('click', '.staff-category-li a', function (e) {
         e.preventDefault();
         $(this).parent().find('.sub-menu').css("left", "0");
     });

    $('#editModalStaff').on('click', '.selectbox', function (e) {
        e.preventDefault();
        $('.selectdrop').slideToggle();
    });

    $('#editModalStaff').on('click', '.selectdrop .sub-menu li:first-child a', function (e) {
        e.preventDefault();
        $('#editModalStaff').find('.sub-menu').css("left", "355px");
    });

    // Staff pop up end

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
