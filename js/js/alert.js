export const hideAlert = () =>{
    const el = document.querySelector('.alert')
    if (el) el.parentElement.removeChild(el)
}

//type if 'success' or 'erroe'
export const showAlert = (type,msg)=>{
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',markup)
    window.setTimeout(hideAlert,5000)
}

export function customAlert(message) {
    const alertModal = document.createElement('div');
    alertModal.innerHTML = `
        <div id="customAlertModal" class="custom-modal" style="display: flex;">
            <div class="custom-modal-content">
                <p id="customAlertMessage">${message}</p>
                <button id="customAlertOkButton" class="btn btn-primary">OK</button>
            </div>
        </div>`;
    document.body.appendChild(alertModal);

    document.getElementById('customAlertOkButton').onclick = function() {
        document.body.removeChild(alertModal); // Remove modal after clicking OK
    };
}

export function customConfirm(message, callback) {
    const confirmModal = document.createElement('div');
    confirmModal.innerHTML = `
        <div id="customConfirmModal" class="custom-modal" style="display: flex;">
            <div class="custom-modal-content">
                <p id="customConfirmMessage">${message}</p>
                <button id="customConfirmYesButton" class="btn btn-success">Yes</button>
                <button id="customConfirmNoButton" class="btn btn-secondary">No</button>
            </div>
        </div>`;
    document.body.appendChild(confirmModal);

    document.getElementById('customConfirmYesButton').onclick = function() {
        document.body.removeChild(confirmModal);
        callback(true);
    };

    document.getElementById('customConfirmNoButton').onclick = function() {
        document.body.removeChild(confirmModal);
        callback(false);
    };
}


// Styles for the custom modals
const styles = `
    .custom-modal {
        display: flex;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
    }

    .custom-modal-content {
        background-color: #fff;
        padding: 20px;
        border: 1px solid #888;
        width: 300px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
    }

    .btn {
        margin: 10px 5px;
        padding: 8px 16px;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    }

    .btn-primary {
        background-color: #0dcaf0;
        color: white;
    }

    .btn-success {
        background-color: #0dcaf0;
        color: white;
    }

    .btn-secondary {
        background-color: #f44336;
        color: white;
    }
`;

// Append styles to document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);