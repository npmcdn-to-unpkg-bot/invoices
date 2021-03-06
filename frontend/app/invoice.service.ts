import { Invoice } from './invoice';
import { Injectable } from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import 'rxjs/operator/map';

@Injectable()
export class InvoiceService {
    private url = 'http://ec2-54-191-220-117.us-west-2.compute.amazonaws.com:55246/';
    private total = null;
    private totalTax = null;
    private vat = 18;
    private i = 0;
    constructor(private _http: Http) {}

    getInvoices(): Promise<Invoice[]> {
        return this._http.get(this.url + 'Invoices/')
            .map((response: any) => response.json()).toPromise();
    }

    getInvoice(id: number) {
        return this._http.get(this.url + 'Invoices/Detail/' + id)
            .map((response: any) => response.json()).toPromise();
    }

    calculateTotalRows(){
        $(".row").each(function(){
            var hours = parseInt($(this).find('input[type=text]').eq(1).val());
            var price = parseInt($(this).find('input[type=text]').eq(2).val());
            $(this).find('.total-row').val(hours*price);
        });
    }
    calculateTotal(){
        var sum = 0;
        $(".row").each(function(){
            var total = parseInt($(this).find('.total-row').val());
            if(!isNaN(total))
                sum += total;
            else
                throw "Can not parse value. Please check the input value.";
        });
        $("#total-sum").val(sum);
        this.total = sum;
    }
    calculateTotalTax(){
        var totalWithTaxes = (((this.total*this.vat)/100) + this.total).toFixed(2);
        $("#total-tax-sum").val(totalWithTaxes);
        this.totalTax = totalWithTaxes;
    }
    addRow(){
        var row = $('<tr class="row">' +
            '<td><input type="text" name="fields[' + this.i + '][name]"></td>' +
            '<td><input type="text" name="fields[' + this.i + '][hours]" class="numeric" value="0"></td>' +
            '<td><input type="text" name="fields[' + this.i + '][price]" class="numeric" value="0"></td>' +
            '<td><input type="text" name="fields[' + this.i + '][comment]"></td>' +
            '<td><input type="text" name="fields[' + this.i + '][total]" class="total-row" readonly></td>' +
            '</tr>').clone();
        this.i++;
        if($(".row").length)
            row.insertAfter(".row:last");
        else
            row.insertAfter(".header-colum");
    }
    calculate(){
        this.calculateTotalRows();
        this.calculateTotal();
        this.calculateTotalTax();
    }
    save(){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        this._http.post(this.url + 'Invoices/Create', $("#invoice-form").serialize2Json(), {
            headers: headers
        }).subscribe(
            data => {
                /*var obj = data.json();
                $('<li>' +
                 '<span class="badge">'+ obj.Id + '</span> '+ obj.Number +
                 '</li>')
                    .appendTo(".invoices");*/
                $('.modal').hide();
                window.location.reload();
            },
            err => console.log(err)
        );
    }

    onlyNumericFilter(e){
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }
}

$.fn.serialize2Json = function(){

    var self = this,
        json = {},
        push_counters = {},
        patterns = {
            "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
            "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
            "push":     /^$/,
            "fixed":    /^\d+$/,
            "named":    /^[a-zA-Z0-9_]+$/
        };


    this.build = function(base, key, value){
        base[key] = value;
        return base;
    };

    this.push_counter = function(key){
        if(push_counters[key] === undefined){
            push_counters[key] = 0;
        }
        return push_counters[key]++;
    };

    $.each($(this).serializeArray(), function(){

        // skip invalid keys
        if(!patterns.validate.test(this.name)){
            return;
        }

        var k,
            keys = this.name.match(patterns.key),
            merge = this.value,
            reverse_key = this.name;

        while((k = keys.pop()) !== undefined){

            // adjust reverse_key
            reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

            // push
            if(k.match(patterns.push)){
                merge = self.build([], self.push_counter(reverse_key), merge);
            }

            // fixed
            else if(k.match(patterns.fixed)){
                merge = self.build([], k, merge);
            }

            // named
            else if(k.match(patterns.named)){
                merge = self.build({}, k, merge);
            }
        }

        json = $.extend(true, json, merge);
    });

    return JSON.stringify(json);
};

/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */