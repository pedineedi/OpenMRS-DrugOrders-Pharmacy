/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.drugorders.api.db;

import java.util.List;
import org.openmrs.module.drugorders.drugorders;
import org.openmrs.module.drugorders.api.drugordersService;

/**
 *  Database methods for {@link drugordersService}.
 */
public interface drugordersDAO {
	
    // Get last assigned Group ID
    public int getLastGroupID();
    // Get orders placed on hold
    public List<drugorders> getOrdersOnHold();
    // Get orders requested to be discarded
    public List<drugorders> getOrdersForDiscard();
    // Save the drug order record
    public drugorders saveDrugOrder(drugorders drugOrder);
    // Get order by refering to the order ID
    public drugorders getDrugOrderByOrderID(Integer orderId);
    // Get order by refering to the group ID
    public List<drugorders> getDrugOrdersByGroupID(Integer groupId);
        
}