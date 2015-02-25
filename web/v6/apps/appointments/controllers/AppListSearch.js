angular.module("QeaSys").controller('ListSearch', ['$scope','$state', '$rootScope','ListSearchService','toaster',
   function($scope,$state, $localStorage,ListSearchService,toaster ) {

    $scope.defaultIcon = function(){
        return 'img/movie_icon.jpg';
    }

    $scope.page =1;
    $scope.totalItems =5;
    $scope.count =0;

    $scope.back= false;
    
    $scope.dataList =[
        //{ area :'Doctors', type: 'General Practioners', img :'img/hospital_icon.jpg'}
    ]

    if( localStorage.searchData ){
        console.log("========Search data retrieved from LocalStorage=======");
       // $scope.dataList = JSON.parse(localStorage.searchData);
    }
    else{
        var promise=ListSearchService.getSubjectAreaList(  $scope) ;
         promise.then(function(events){
            $scope.dataList=[];
            $.each(events, function() {
                console.log(this);
                $scope.dataList.push(this);
            });
            //localStorage.searchData = JSON.stringify($scope.dataList);
        });
     }

    $scope.getSubjectArea = function(){
        if( localStorage.searchData ){
            console.log("========Search data retrieved from LocalStorage=======");
            //$scope.dataList = JSON.parse(localStorage.searchData);
        }
        else{
            var promise=ListSearchService.getSubjectAreaList(  $scope) ;
            promise.then(function(events){
                $scope.dataList=[];
                $.each(events, function() {
                    console.log(this);
                    $scope.dataList.push(this);
                });
                //localStorage.searchData = JSON.stringify($scope.dataList);
            });
        }
    }

     $scope.goBack = function() {
        window.history.back();
    };
   $scope.home = function(){
        $scope.back= false;
        $scope.getSubjectArea();
    }

    $scope.count =$scope.dataList.length;
    $scope.$broadcast('count', $scope.dataList.length);

    $scope.$on('page', function(event, pageCount){
          console.log(pageCount);
          $scope.page= pageCount;
         // $scope.$broadcast('count', $scope.dataList.length);
      });
    
    $scope.SelectDetails = function(id){
        console.log(id);
    } 
     $scope.home = function(){
        $scope.back= false;
        $scope.getSubjectArea();
    }
    $scope.fetchDetails = function( index ){
        $scope.back= true;
        console.log("load doctors");
        $scope.fetchAdditionalDetails($scope.dataList[index].area);
    }
    $scope.Bookmark = function(index){
        $.each($scope.dataList, function(){
            console.log( this._id  +":"+ index);
            if( this._id == index ){
                localStorage.addtoFav = JSON.stringify(this);
                console.log("Show toaster");
                toaster.pop('success', '', this.name+ ' added to Fav');
                return;
            }
        })
    }
    $scope.BookAppointment = function(index){
        
        $.each($scope.dataList, function(){
            console.log( this._id  +":"+ index);
            if( this._id == index ){
                localStorage.NewAppointment = JSON.stringify(this);
                localStorage.flowFrom = 'Book Appointment';
                $state.go('layout.appointment');
                return;
            }
            
        })
        
    }
    $scope.fetchAdditionalDetails = function(searchData){
         var promise=ListSearchService.getSearchList(  searchData, $scope) ;
         promise.then(function(events){
            $scope.dataList=[];
            $.each(events, function() {
                console.log(this);
                $scope.dataList.push(this);
            });
            $scope.count =$scope.dataList.length;
            $scope.$broadcast('count', $scope.dataList.length);
    
        });
    }

    $scope.fetchCompanies = function(){
        $scope.dataList =[];
       
    }  
    $scope.add = function(){
        $scope.dataList.push({id:'16', area :'16', img :'img/a4.jpg'});
        $scope.count =$scope.dataList.length;
        $scope.$broadcast('count', $scope.dataList.length);
    }
    console.log(' count ---- ' + $scope.count);  
}]);

