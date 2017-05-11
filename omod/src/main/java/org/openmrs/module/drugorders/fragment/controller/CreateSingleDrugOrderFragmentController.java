/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.openmrs.module.drugorders.fragment.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import org.openmrs.Concept;
import org.openmrs.ConceptClass;
import org.openmrs.ConceptSearchResult;
import org.openmrs.OrderFrequency;
import org.openmrs.Patient;
import org.openmrs.api.ConceptService;
import org.openmrs.api.context.Context;
import org.openmrs.ui.framework.SimpleObject;
import org.openmrs.ui.framework.UiUtils;
import org.openmrs.ui.framework.annotation.SpringBean;
import org.openmrs.ui.framework.page.PageModel;
import org.springframework.web.bind.annotation.RequestParam;

/**
 *
 * @author harini-geek
 */
public class CreateSingleDrugOrderFragmentController {
    
    /**
     *
     * @param model
     * @param patient
     */
    
    public void controller(PageModel model, @RequestParam("patientId") Patient patient){
                
        Date startDate = Calendar.getInstance().getTime();
        model.addAttribute("startDate", startDate);
                
        /*
          Get the list of concepts belonging to a particular concept class
        */
        List<Concept> doses = ConceptList("Units of Dose");
        model.addAttribute("doses", doses);        
        
        List<Concept> priorities = ConceptList("Order Priority");
        model.addAttribute("priorities", priorities);
        
        List<Concept> durations = ConceptList("Units of Duration");
        model.addAttribute("durations", durations);
        
        List<Concept> quantities = ConceptList("Units of Quantity");
        model.addAttribute("quantities", quantities);        
        
        List<Concept> routes = ConceptList("Routes of drug administration");
        model.addAttribute("routes", routes);
        
        List<OrderFrequency> frequencies = Context.getOrderService().getOrderFrequencies(true);
        model.addAttribute("frequencies", frequencies);
    }
    
    /*
      Get the list of concepts belonging to a particular concept class
    */
    private List<Concept> ConceptList(String conceptString){
        ConceptClass conceptClass = Context.getConceptService().getConceptClassByName(conceptString);
        return Context.getConceptService().getConceptsByClass(conceptClass);
    }
    
    /*
      Get drug name suggestions as the user types the first few characters of the drug name field
    */
    public List<SimpleObject> getDrugNameSuggestions(@RequestParam(value = "query", required = false) String query,
                                                     @SpringBean("conceptService") ConceptService service,
                                                     UiUtils ui) {
        
        ConceptClass drugConcept = Context.getConceptService().getConceptClassByName("Drug");
        List<ConceptClass> requireClasses = new ArrayList<>();
        requireClasses.add(drugConcept);
        
        List<ConceptSearchResult> results = Context.getConceptService().getConcepts(query, null, false, requireClasses, null, null, null, null, 0, 100);
        
        List<Concept> names = new ArrayList<>();
        for (ConceptSearchResult con : results) {
            names.add(con.getConcept());
        }
        String[] properties = new String[] { "name"};
        return SimpleObject.fromCollection(names, ui, properties);
    }
    
    /*
      Get disease name suggestions as the users types the first few characters of a disease.
    */
    public List<SimpleObject> getDiseaseNameSuggestions(@RequestParam(value = "query", required = false) String query,
                                                        @SpringBean("conceptService") ConceptService service,
                                                        UiUtils ui) {
        
        ConceptClass diseaseConcept = Context.getConceptService().getConceptClassByName("Diagnosis");
        List<ConceptClass> requireClasses = new ArrayList<>();
        requireClasses.add(diseaseConcept);
        
        List<ConceptSearchResult> results = Context.getConceptService().getConcepts(query, null, false, requireClasses, null, null, null, null, 0, 100);
        
        List<Concept> names = new ArrayList<>();
        for (ConceptSearchResult con : results) {
            names.add(con.getConcept());
        }
        String[] properties = new String[] { "name"};
        return SimpleObject.fromCollection(names, ui, properties);
    }
}