function openDeleteStationModal(stationId, stationName) {
    document.getElementById('deleteStationName').textContent = stationName;
    document.getElementById('confirmDeleteStationBtn').onclick = function() {
        deleteStation(stationId);
    };

    const modal = new bootstrap.Modal(document.getElementById('DeleteStationModal'));
    modal.show();
}

function deleteStation(stationId) { 
    const token =localStorage.getItem('access_token');
    makeApiRequest(`/api/stations/${stationId}`, {
        method: 'DELETE'
    })

        .then(data => {
            if (data.message) {
                console.log(data.message);
                showAlert('stationsAlert', 'success', data.message);
                loadStations(); // Reload the table
                closeModal('DeleteStationModal');
                
            } else if (data.error){
                showAlert('deleteStationAlert', 'danger', data.error );
            }
        })
        .catch(error => {
            console.error('Error deleting station:', error);
            showAlert('deleteStationAlert', 'danger', 'სადგურის წაშლა ვერ მოხერხდა.');
        });
}