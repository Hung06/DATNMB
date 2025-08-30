const db = require('../config/database');

async function debugParkingLot13() {
    try {
        console.log('=== DEBUG PARKING LOT 13 ===');
        
        // 1. Kiểm tra dữ liệu parking spots thô
        console.log('\n1. Raw parking spots data:');
        const [spots] = await db.execute(`
            SELECT spot_id, spot_number, is_occupied, is_reserved, 
                   CAST(is_occupied AS UNSIGNED) as is_occupied_num,
                   CAST(is_reserved AS UNSIGNED) as is_reserved_num
            FROM parking_spots 
            WHERE lot_id = 13 
            ORDER BY spot_number
        `);
        
        spots.forEach(spot => {
            console.log(`  ${spot.spot_number}: occupied=${spot.is_occupied}(${spot.is_occupied_num}), reserved=${spot.is_reserved}(${spot.is_reserved_num})`);
        });
        
        // 2. Test availability calculation
        console.log('\n2. Availability calculation:');
        const [availability] = await db.execute(`
            SELECT 
                COUNT(*) as total_spots,
                SUM(CASE WHEN is_occupied = 0 AND is_reserved = 0 THEN 1 ELSE 0 END) as available_method1,
                SUM(CASE WHEN CAST(is_occupied AS UNSIGNED) = 0 AND CAST(is_reserved AS UNSIGNED) = 0 THEN 1 ELSE 0 END) as available_method2,
                SUM(CASE WHEN is_occupied = false AND is_reserved = false THEN 1 ELSE 0 END) as available_method3
            FROM parking_spots 
            WHERE lot_id = 13
        `);
        
        console.log('  Calculation results:', availability[0]);
        
        // 3. Kiểm tra từng spot chi tiết
        console.log('\n3. Detailed spot analysis:');
        spots.forEach(spot => {
            const isAvailable = (!spot.is_occupied && !spot.is_reserved);
            const isAvailableNum = (spot.is_occupied_num === 0 && spot.is_reserved_num === 0);
            console.log(`  ${spot.spot_number}: ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'} (num check: ${isAvailableNum})`);
        });
        
        // 4. Manual count
        const manualCount = spots.filter(spot => !spot.is_occupied && !spot.is_reserved).length;
        console.log(`\n4. Manual count: ${manualCount} available spots`);
        
        // 5. Test parking lot query
        console.log('\n5. Parking lot query result:');
        const [lotResult] = await db.execute(`
            SELECT 
                pl.lot_id as id,
                pl.name,
                pl.total_spots as totalSpots,
                COALESCE(SUM(CASE WHEN ps.is_occupied = 0 AND ps.is_reserved = 0 THEN 1 ELSE 0 END), 0) as availableSpots
            FROM parking_lots pl
            LEFT JOIN parking_spots ps ON pl.lot_id = ps.lot_id
            WHERE pl.lot_id = 13
            GROUP BY pl.lot_id
        `);
        
        console.log('  Result:', lotResult[0]);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

debugParkingLot13();
