// Handle edit form submission
if (document.getElementById('editStationForm')) {
    document.getElementById('editStationForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const submitButton = document.getElementById('submitEditStationBtn');
        submitButton.disabled = true;

        const stationId = document.getElementById('editStationId').value;
        const formData = new FormData(document.getElementById('editStationForm'));
        const payload = {
            station_name: formData.get('station_name'),
            url: formData.get('url'),
            latitude: Number(formData.get('latitude')),
            longitude: Number(formData.get('longitude')),
            map_selected: Number(formData.get('map_selected')),
            map_status: document.getElementById('editMapStatus').checked,
            fetch_status: document.getElementById('editFetchStatus').checked
        };

        makeApiRequest(`/api/stations/${stationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(data => {
                if (data.message) {
                    showAlert('editStationAlert', 'success', data.message);
                    loadStations(); // Reload the table
                    bootstrap.Modal.getInstance(document.getElementById('EditStationModal')).hide();
                } else {
                    showAlert('editStationAlert', 'danger', (data && data.error) ? data.error : 'სადგურის რედაქტირება ვერ მოხერხდა.');
                }
            })
            .catch(error => {
                console.error('Error editing station:', error);
                showAlert('editStationAlert', 'danger', 'სადგურის რედაქტირება ვერ მოხერხდა.');
            })
            .finally(() => {
                submitButton.disabled = false;
            });
    });
}

function openEditStationModal(stationId) {
    // First, fetch the station data
    makeApiRequest(`/api/stations/${stationId}`, {
        method: 'GET'
    })
        .then(station => {
            // Populate the edit form
            document.getElementById('editStationId').value = station.id;
            document.getElementById('editStationName').value = station.station_name;
            document.getElementById('editStationUrl').value = station.url;
            document.getElementById('editLatitude').value = station.latitude;
            document.getElementById('editLongitude').value = station.longitude;
            document.getElementById('editMapSelected').value = station.map_selected !== undefined && station.map_selected !== null ? station.map_selected : 1;
            document.getElementById('editMapStatus').checked = station.map_status;
            document.getElementById('editFetchStatus').checked = station.fetch_status;

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('EditStationModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error fetching station:', error);
            showAlert('stationsAlert', 'danger', 'სადგურის მონაცემების ჩატვირთვა ვერ მოხერხდა.');
        });
}