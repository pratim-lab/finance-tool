if (!$) {
    $ = django.jQuery;
}

$(document).ready(function () {

    let expenseTypes = [];
    const $expenseTypeModal = $("#modal-expense-type");
    const $expenseTypeDeleteConfirmationModal = $("#modal-expense-type-delete-confirmation");
    let selectedExpenseTypeId = null;

    function getExpenseTypeLiHtml(expenseType) {
        return `
            <li>
                <div class="editarea">
                    <div class="editname">
                        <input type="text" class="fieldinput expense-txt" value="${expenseType.expense_name}" disabled>
                    </div>
                    <div class="editbtn">
                        <a href="#" class="editbtn btn-delete-expense-type" data-id="${expenseType.id}">
                            <img src="/static/custom_admin_assets/images/delete_minor.svg"alt="">
                        </a>
                        <a href="#" class="editbtn btn-edit-mode-expense-type" data-id="${expenseType.id}">
                            <img src="/static/custom_admin_assets/images/edit_minor.svg" alt=""/>
                        </a>
                        <a href="#" class="editbtn btn-edit-expense-type" data-id="${expenseType.id}" style="display: none;">
                            <img src="/static/custom_admin_assets/images/tick-icon.svg" alt=""/>
                        </a>
                    </div>
                </div>
            </li>`;
    }

    function getExpenseTypeLisHtml() {
        let expenseTypeLiHtml = '';
        for (let i = 0; i < expenseTypes.length; i++) {
            expenseTypeLiHtml += getExpenseTypeLiHtml(expenseTypes[i]);
        }
        return `
            <li class="addcat">
                <a href="#" id="btn-add-expense-type" class="editbtn"><img src="/static/custom_admin_assets/images/plus-icon.svg" alt=""> Add
                    expense category</a>
            </li>
            <li id="li-new-expense-type" style="display:none;">
                <div class="editarea">
                    <div class="editname">
                        <input type="text" placeholder="(new expense)" id="txt-expense-type-name" class="fieldinput"/>
                    </div>
                    <div class="editbtn">
                        <a href="#" id="btn-hide-expense-type-txt" class="editbtn"><img src="/static/custom_admin_assets/images/delete_minor.svg" alt=""></a>
                        <a href="#" id="btn-save-expense-type" class="editbtn"><img src="/static/custom_admin_assets/images/tick-icon.svg" alt=""/></a>
                    </div>
                </div>
          </li>
            ${expenseTypeLiHtml}
        `;
    }

    function showExpenseTypeModal() {
        $expenseTypeModal.modal("show");
    }

    function hideExpenseTypeModal() {
        $expenseTypeModal.modal("hide");
    }

    function populateExpenseTypes() {
        const expenseTypeLisHtml = getExpenseTypeLisHtml();
        $expenseTypeModal.find("ul").html(expenseTypeLisHtml);
        showExpenseTypeModal();
    }

    function removeDeletedExpenseType(expenseTypeId) {
        for (let i = 0; i < expenseTypes.length; i++) {
            if (expenseTypes[i].id == expenseTypeId) {
                expenseTypes.splice(i, 1);
                break;
            }
        }
        populateExpenseTypes();
    }

    async function fetchExpenseTypes() {
        let path = '/custom-admin/operations/expense/expense-type/api/list';
        const response = await apiClient.get(path);
        expenseTypes = response.data;
        populateExpenseTypes();
    }

    $("#btn-show-expense-type").on("click", async function (e){
        e.preventDefault();
        await fetchExpenseTypes();
    });

    $expenseTypeModal.on('click', '.btn-edit-mode-expense-type', async function (e) {
        e.preventDefault();
        $(this).parents('.editarea').find('.expense-txt').prop('disabled', false);
        $(this).hide();
        $(this).parents('.editarea').find('.btn-edit-expense-type').show();
    });

    $expenseTypeModal.on('click', '.btn-edit-expense-type', async function (e) {
        e.preventDefault();
        const id = $(this).attr('data-id');
        const updatedName = $(this).parents('.editarea').find('.expense-txt').val();
        let requestData = {
            expense_name: updatedName
        };
        const resp = await apiClient.patch(`/custom-admin/operations/expense/expense-type/api/${id}`, requestData);
        $(this).parents('.editarea').find('.expense-txt').prop('disabled', true);
        $(this).hide();
        $(this).parents('.editarea').find('.btn-edit-mode-expense-type').show();
    });

    $expenseTypeModal.on('click', '.btn-delete-expense-type', async function (e) {
        e.preventDefault();
        selectedExpenseTypeId = $(this).attr('data-id');
        $expenseTypeDeleteConfirmationModal.modal("show");
    });

    $expenseTypeDeleteConfirmationModal.on('click', '#btn-confirm-delete-expense-type', async function(e){
        const resp = await apiClient.delete(`/custom-admin/operations/expense/expense-type/api/${selectedExpenseTypeId}`);
        removeDeletedExpenseType(selectedExpenseTypeId);
        $expenseTypeDeleteConfirmationModal.modal("hide");
    });

    $expenseTypeDeleteConfirmationModal.on('hide.bs.modal', function(){
        $expenseTypeModal.modal('show');
    });

    $expenseTypeDeleteConfirmationModal.on('show.bs.modal', function(){
        $expenseTypeModal.modal('hide');
    });

    $expenseTypeModal.on("click", "#btn-add-expense-type", async function(e) {
        e.preventDefault();
        $expenseTypeModal.find('#li-new-expense-type').show();
        $expenseTypeModal.find('#txt-expense-type-name').val("");
    });

    $expenseTypeModal.on("click", "#btn-hide-expense-type-txt", async function(e) {
        e.preventDefault();
        $expenseTypeModal.find('#li-new-expense-type').hide();
    });

    $expenseTypeModal.on("click", "#btn-save-expense-type", async function(e) {
        e.preventDefault();
        const expenseTypeName = $expenseTypeModal.find('#txt-expense-type-name').val();
        let requestData = {
            expense_name: expenseTypeName
        };
        const resp = await apiClient.post("/custom-admin/operations/expense/expense-type/api/add", requestData);
        $expenseTypeModal.find('#li-new-expense-type').hide();
        $expenseTypeModal.find('#txt-expense-type-name').val("");
        expenseTypes = [resp.data, ...expenseTypes];
        populateExpenseTypes();
    });

});