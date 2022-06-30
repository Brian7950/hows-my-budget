//hold DB
let db;
const request = indexedDB.open('budget_tracker', 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore('budget_tracker', { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  // check if online
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(formData) {
  const transaction = db.transaction(['budget_tracker'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('budget_tracker');
  transactionObjectStore.add(formData);
}
function uploadTransaction() {
  const transaction = db.transaction(['budget_tracker'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('budget_tracker');
  const getAll = transactionObjectStore.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['budget_tracker'], 'readwrite');
          const transactionObjectStore =
            transaction.objectStore('budget_tracker');

          // clear items
          transactionObjectStore.clear();

          alert('All saved transaction has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}
window.addEventListener('online', uploadTransaction);